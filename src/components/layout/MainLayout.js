import React from "react";
import LeftSidebar from "./LeftSidebar";
import { useAuth } from "../../contexts/AuthContext";
import UserMenu from "../auth/UserMenu";

const MainLayout = ({ children, openSearchModal, openLoginModal, openRegisterModal }) => {
  const { user, isSupabaseConfigured } = useAuth();

  return (
    <div className="flex min-h-screen bg-dex-bg-primary text-dex-text-primary">
      <LeftSidebar openSearchModal={openSearchModal} />
      <main className="flex-1 flex flex-col">
        {/* Top bar z menu użytkownika */}
        <div className="flex justify-end items-center p-4 border-b border-dex-border">
          {!isSupabaseConfigured && (
            <div className="mr-4 px-3 py-1 bg-yellow-900/30 border border-yellow-500 text-yellow-400 rounded text-sm">
              Funkcje autentykacji niedostępne
            </div>
          )}
          
          {isSupabaseConfigured && user ? (
            <UserMenu />
          ) : isSupabaseConfigured ? (
            <div className="flex space-x-2">
              <button
                onClick={openLoginModal}
                className="px-4 py-2 text-dex-text-primary hover:text-dex-blue transition-colors"
              >
                Zaloguj się
              </button>
              <button
                onClick={openRegisterModal}
                className="px-4 py-2 bg-dex-blue hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Zarejestruj się
              </button>
            </div>
          ) : null}
        </div>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;