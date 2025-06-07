/*
  # Usunięcie Row Level Security

  1. Wyłączenie RLS
    - Wyłączenie RLS dla tabeli `user_profiles`
    - Wyłączenie RLS dla tabeli `favorite_tokens`

  2. Usunięcie polityk
    - Usunięcie wszystkich polityk dla `user_profiles`
    - Usunięcie wszystkich polityk dla `favorite_tokens`

  3. Uprawnienia
    - Nadanie pełnych uprawnień dla authenticated users
*/

-- Wyłącz RLS dla user_profiles
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Usuń wszystkie polityki dla user_profiles
DROP POLICY IF EXISTS "Użytkownicy mogą widzieć swój profil" ON public.user_profiles;
DROP POLICY IF EXISTS "Użytkownicy mogą wstawiać swój profil" ON public.user_profiles;
DROP POLICY IF EXISTS "Użytkownicy mogą aktualizować swój profil" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.user_profiles;

-- Wyłącz RLS dla favorite_tokens
ALTER TABLE public.favorite_tokens DISABLE ROW LEVEL SECURITY;

-- Usuń wszystkie polityki dla favorite_tokens
DROP POLICY IF EXISTS "Użytkownicy mogą widzieć swoje ulubione" ON public.favorite_tokens;
DROP POLICY IF EXISTS "Użytkownicy mogą dodawać ulubione" ON public.favorite_tokens;
DROP POLICY IF EXISTS "Użytkownicy mogą usuwać swoje ulubione" ON public.favorite_tokens;

-- Nadaj pełne uprawnienia dla authenticated users
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.favorite_tokens TO authenticated;

-- Nadaj uprawnienia do sekwencji (jeśli istnieją)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Upewnij się, że anon users też mają dostęp do odczytu (opcjonalnie)
GRANT SELECT ON public.user_profiles TO anon;
GRANT SELECT ON public.favorite_tokens TO anon;