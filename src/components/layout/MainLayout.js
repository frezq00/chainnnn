import React from "react";
import LeftSidebar from "./LeftSidebar";
import { useAuth } from "../../contexts/AuthContext";
import UserMenu from "../auth/UserMenu";

const MainLayout = ({ children, openSearchModal, openLoginModal, openRegisterModal }) => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-dex-bg-primary text-dex-text-primary">
      <LeftSidebar openSearchModal={openSearchModal} />
      <main className="flex-1 flex flex-col">
        {/* Top bar z menu użytkownika */}
        <div className="flex justify-end items-center p-4 border-b border-dex-border">
          {user ? (
            <UserMenu />
          ) : (
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
          )}
        </div>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
