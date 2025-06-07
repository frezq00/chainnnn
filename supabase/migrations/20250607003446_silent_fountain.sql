/*
  # Inicjalna konfiguracja systemu autentykacji i ulubionych tokenów

  1. Nowe tabele
    - `user_profiles`
      - `id` (uuid, primary key, foreign key do auth.users)
      - `email` (text, unique)
      - `full_name` (text, nullable)
      - `avatar_url` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `favorite_tokens`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key do user_profiles)
      - `token_address` (text)
      - `chain_id` (text)
      - `token_name` (text, nullable)
      - `token_symbol` (text, nullable)
      - `token_logo` (text, nullable)
      - `added_at` (timestamp)

  2. Bezpieczeństwo
    - Włączenie RLS na wszystkich tabelach
    - Polityki dostępu dla uwierzytelnionych użytkowników
    - Trigger do automatycznego tworzenia profilu użytkownika

  3. Funkcje
    - Funkcja do obsługi nowych użytkowników
*/

-- Tworzenie tabeli profili użytkowników
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Włączenie RLS dla tabeli user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Polityki dla tabeli user_profiles
CREATE POLICY "Użytkownicy mogą widzieć swój profil"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Użytkownicy mogą wstawiać swój profil"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Użytkownicy mogą aktualizować swój profil"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Tworzenie tabeli ulubionych tokenów
CREATE TABLE IF NOT EXISTS favorite_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_address text NOT NULL,
  chain_id text NOT NULL,
  token_name text,
  token_symbol text,
  token_logo text,
  added_at timestamptz DEFAULT now(),
  UNIQUE(user_id, token_address, chain_id)
);

-- Włączenie RLS dla tabeli favorite_tokens
ALTER TABLE favorite_tokens ENABLE ROW LEVEL SECURITY;

-- Polityki dla tabeli favorite_tokens
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

-- Funkcja do obsługi nowych użytkowników
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger do automatycznego tworzenia profilu dla nowych użytkowników
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Funkcja do aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger do automatycznej aktualizacji updated_at w user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();