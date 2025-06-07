import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import SearchButton from "./SearchButton";
import NavigationMenu from "./NavigationMenu";
import ChainSelector from "./ChainSelector";
import UserMenu from "../../auth/UserMenu";
import LoginModal from "../../auth/LoginModal";
import RegisterModal from "../../auth/RegisterModal";

const LeftSidebar = ({ openSearchModal }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [showRegisterModal, setShowRegisterModal] = React.useState(false);

  const handleChainSelect = (chainId) => {
    navigate(`/${chainId}`);
  };

  const switchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  return (
    <>
      <div className="w-64 bg-dex-bg-secondary text-dex-text-primary flex flex-col border-r border-dex-border h-screen sticky top-0 overflow-y-auto">
        <div className="p-4 flex-1">
          <Link to="/" className="block">
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-green-400 text-xl font-mono">
                  <span className="text-2xl">&#9002;</span>
                </span>
                <span className="font-bold text-lg">DEX Terminal</span>
              </div>
              <span className="text-xs text-gray-400 ml-7">
                Powered by Moralis
              </span>
            </div>
          </Link>
          <SearchButton openSearchModal={openSearchModal} />
          <NavigationMenu />
          <ChainSelector />
        </div>

        {/* User section at bottom */}
        <div className="p-4 border-t border-dex-border">
          {user ? (
            <UserMenu />
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full bg-dex-blue hover:bg-blue-600 text-white py-2 rounded-lg"
              >
                Login
              </button>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="w-full bg-dex-bg-tertiary hover:bg-dex-bg-highlight text-dex-text-primary py-2 rounded-lg"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        switchToRegister={switchToRegister}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        switchToLogin={switchToLogin}
      />
    </>
  );
};

export default LeftSidebar;
