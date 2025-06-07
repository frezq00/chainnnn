/*
  # System użytkowników i ulubionych tokenów

  1. Nowe tabele
    - `user_profiles` - Profile użytkowników
    - `favorite_tokens` - Ulubione tokeny użytkowników
    
  2. Bezpieczeństwo
    - Włączenie RLS na wszystkich tabelach
    - Polityki dostępu dla użytkowników
*/

-- Tabela profili użytkowników
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela ulubionych tokenów
CREATE TABLE IF NOT EXISTS favorite_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token_address text NOT NULL,
  chain_id text NOT NULL,
  token_name text,
  token_symbol text,
  token_logo text,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, token_address, chain_id)
);

-- Włączenie RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_tokens ENABLE ROW LEVEL SECURITY;

-- Polityki dla user_profiles
CREATE POLICY "Użytkownicy mogą widzieć swój profil"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Użytkownicy mogą aktualizować swój profil"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Użytkownicy mogą wstawiać swój profil"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Polityki dla favorite_tokens
CREATE POLICY "Użytkownicy mogą widzieć swoje ulubione"
  ON favorite_tokens
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą dodawać ulubione"
  ON favorite_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Użytkownicy mogą usuwać swoje ulubione"
  ON favorite_tokens
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Funkcja do automatycznego tworzenia profilu
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger do tworzenia profilu przy rejestracji
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();