/*
  # Bezpieczna migracja - tworzenie tabel i polityk z sprawdzaniem istnienia

  1. Nowe tabele
    - `user_profiles` - profile użytkowników z podstawowymi informacjami
    - `favorite_tokens` - ulubione tokeny użytkowników
  
  2. Zabezpieczenia
    - Włączenie RLS dla wszystkich tabel
    - Polityki dostępu dla uwierzytelnionych użytkowników
    - Automatyczne tworzenie profili dla nowych użytkowników
  
  3. Funkcje
    - `update_updated_at_column()` - aktualizacja timestampów
    - `handle_new_user()` - automatyczne tworzenie profili
*/

-- Funkcja do aktualizacji updated_at (bezpieczne tworzenie)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tabela profili użytkowników (bezpieczne tworzenie)
CREATE TABLE IF NOT EXISTS user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text UNIQUE NOT NULL,
    full_name text,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Włączenie RLS dla user_profiles (bezpieczne)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'user_profiles' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Bezpieczne tworzenie polityk dla user_profiles
DO $$
BEGIN
    -- Polityka SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Użytkownicy mogą widzieć swój profil'
    ) THEN
        CREATE POLICY "Użytkownicy mogą widzieć swój profil"
            ON user_profiles
            FOR SELECT
            TO authenticated
            USING (auth.uid() = id);
    END IF;

    -- Polityka INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Użytkownicy mogą wstawiać swój profil'
    ) THEN
        CREATE POLICY "Użytkownicy mogą wstawiać swój profil"
            ON user_profiles
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = id);
    END IF;

    -- Polityka UPDATE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'Użytkownicy mogą aktualizować swój profil'
    ) THEN
        CREATE POLICY "Użytkownicy mogą aktualizować swój profil"
            ON user_profiles
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = id);
    END IF;
END $$;

-- Bezpieczne tworzenie triggera dla user_profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_user_profiles_updated_at'
    ) THEN
        CREATE TRIGGER update_user_profiles_updated_at
            BEFORE UPDATE ON user_profiles
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Tabela ulubionych tokenów (bezpieczne tworzenie)
CREATE TABLE IF NOT EXISTS favorite_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_address text NOT NULL,
    chain_id text NOT NULL,
    token_name text,
    token_symbol text,
    token_logo text,
    added_at timestamptz DEFAULT now()
);

-- Bezpieczne dodanie unique constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'favorite_tokens_user_id_token_address_chain_id_key'
    ) THEN
        ALTER TABLE favorite_tokens 
        ADD CONSTRAINT favorite_tokens_user_id_token_address_chain_id_key 
        UNIQUE(user_id, token_address, chain_id);
    END IF;
END $$;

-- Włączenie RLS dla favorite_tokens (bezpieczne)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'favorite_tokens' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE favorite_tokens ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Bezpieczne tworzenie polityk dla favorite_tokens
DO $$
BEGIN
    -- Polityka SELECT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'favorite_tokens' 
        AND policyname = 'Użytkownicy mogą widzieć swoje ulubione'
    ) THEN
        CREATE POLICY "Użytkownicy mogą widzieć swoje ulubione"
            ON favorite_tokens
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;

    -- Polityka INSERT
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'favorite_tokens' 
        AND policyname = 'Użytkownicy mogą dodawać ulubione'
    ) THEN
        CREATE POLICY "Użytkownicy mogą dodawać ulubione"
            ON favorite_tokens
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Polityka DELETE
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'favorite_tokens' 
        AND policyname = 'Użytkownicy mogą usuwać swoje ulubione'
    ) THEN
        CREATE POLICY "Użytkownicy mogą usuwać swoje ulubione"
            ON favorite_tokens
            FOR DELETE
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Funkcja do automatycznego tworzenia profilu użytkownika (bezpieczne tworzenie)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Bezpieczne tworzenie triggera dla nowych użytkowników
DO $$
BEGIN
    -- Usuń trigger jeśli istnieje
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    
    -- Utwórz nowy trigger
    CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION handle_new_user();
END $$;