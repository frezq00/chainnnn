/*
  # Bezpieczna migracja systemu autentykacji

  1. Nowe tabele
    - `user_profiles` - profile użytkowników
    - `favorite_tokens` - ulubione tokeny użytkowników
  
  2. Bezpieczeństwo
    - Włączenie RLS na wszystkich tabelach
    - Bezpieczne tworzenie polityk z IF NOT EXISTS
    - Polityki dostępu dla authenticated użytkowników
  
  3. Automatyzacja
    - Trigger dla automatycznego tworzenia profili
    - Auto-update znaczników czasu
*/

-- Tworzenie tabeli profili użytkowników (bezpiecznie)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Włączenie RLS dla tabeli user_profiles (bezpiecznie)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'user_profiles' 
    AND n.nspname = 'public'
    AND c.relrowsecurity = true
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

-- Tworzenie tabeli ulubionych tokenów (bezpiecznie)
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

-- Dodanie ograniczenia unikalności (bezpiecznie)
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

-- Włączenie RLS dla tabeli favorite_tokens (bezpiecznie)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'favorite_tokens' 
    AND n.nspname = 'public'
    AND c.relrowsecurity = true
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

-- Bezpieczne tworzenie funkcji handle_new_user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bezpieczne tworzenie triggera dla nowych użytkowników
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  END IF;
END $$;

-- Bezpieczne tworzenie funkcji update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bezpieczne tworzenie triggera dla updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_user_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_user_profiles_updated_at
      BEFORE UPDATE ON user_profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;