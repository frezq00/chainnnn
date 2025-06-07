# Konfiguracja Supabase dla DEX Terminal

## 🚀 Szybka konfiguracja

### Krok 1: Kliknij "Connect to Supabase"
W prawym górnym rogu aplikacji znajdziesz przycisk **"Connect to Supabase"** - kliknij go, aby rozpocząć konfigurację.

### Krok 2: Utwórz projekt Supabase (jeśli nie masz)
1. Przejdź do [supabase.com](https://supabase.com)
2. Zaloguj się lub utwórz konto
3. Kliknij "New Project"
4. Wybierz organizację i nazwij projekt (np. "dex-terminal")
5. Ustaw hasło do bazy danych
6. Wybierz region (najlepiej najbliższy Twojej lokalizacji)
7. Kliknij "Create new project"

### Krok 3: Pobierz dane konfiguracyjne
Po utworzeniu projektu:
1. Przejdź do **Settings** → **API**
2. Skopiuj:
   - **Project URL** (URL projektu)
   - **anon public** key (klucz publiczny)

### Krok 4: Skonfiguruj zmienne środowiskowe
Dodaj do pliku `.env`:
```
REACT_APP_SUPABASE_URL=twój_project_url
REACT_APP_SUPABASE_ANON_KEY=twój_anon_key
```

## 📋 Co zostanie skonfigurowane

Po połączeniu z Supabase automatycznie zostaną utworzone:

### 🗄️ Tabele bazy danych:
- **user_profiles** - Profile użytkowników
- **favorite_tokens** - Ulubione tokeny użytkowników

### 🔐 Zabezpieczenia:
- Row Level Security (RLS) dla wszystkich tabel
- Polityki dostępu dla uwierzytelnionych użytkowników
- Automatyczne tworzenie profili dla nowych użytkowników

### ⚡ Funkcje:
- **handle_new_user()** - Automatyczne tworzenie profilu
- **update_updated_at_column()** - Aktualizacja timestampów

## 🎯 Dostępne funkcje po konfiguracji

### 👤 Autentykacja:
- ✅ Rejestracja użytkowników
- ✅ Logowanie/wylogowanie
- ✅ Zarządzanie profilami

### ❤️ Ulubione tokeny:
- ✅ Dodawanie tokenów do ulubionych
- ✅ Usuwanie z ulubionych
- ✅ Przeglądanie ulubionych na dashboardzie

### 📊 Dashboard użytkownika:
- ✅ Statystyki użytkownika
- ✅ Lista ulubionych tokenów
- ✅ Szybkie akcje

## 🔧 Rozwiązywanie problemów

### Problem: "Funkcje autentykacji niedostępne"
**Rozwiązanie:** Kliknij "Connect to Supabase" i skonfiguruj zmienne środowiskowe.

### Problem: Błędy migracji
**Rozwiązanie:** Migracje są bezpieczne i idempotentne - można je uruchomić wielokrotnie.

### Problem: Nie mogę się zalogować
**Rozwiązanie:** Sprawdź czy:
1. Zmienne środowiskowe są poprawnie ustawione
2. Projekt Supabase jest aktywny
3. Email confirmation jest wyłączone (domyślnie wyłączone)

## 📞 Wsparcie

Jeśli masz problemy z konfiguracją:
1. Sprawdź konsolę przeglądarki pod kątem błędów
2. Zweryfikuj zmienne środowiskowe w `.env`
3. Upewnij się, że projekt Supabase jest aktywny

---

**Uwaga:** Bez konfiguracji Supabase aplikacja będzie działać w trybie tylko do odczytu - wszystkie funkcje związane z autentykacją i ulubionymi tokenami będą niedostępne.