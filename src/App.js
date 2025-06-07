import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import TrendingPage from "./pages/TrendingPage";
import TokenPage from "./pages/TokenPage";
import SearchModal from "./components/modals/SearchModal";
import PortfolioPage from "./pages/PortfolioPage";
import PumpFunPage from "./pages/PumpFunPage";
import DashboardPage from "./pages/DashboardPage";
import LoginModal from "./components/auth/LoginModal";
import RegisterModal from "./components/auth/RegisterModal";

const App = () => {
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <div className="bg-gray-900 text-white min-h-screen">
          <MainLayout 
            openSearchModal={() => setSearchModalOpen(true)}
            openLoginModal={() => setLoginModalOpen(true)}
            openRegisterModal={() => setRegisterModalOpen(true)}
          >
            <Routes>
              <Route path="/" element={<TrendingPage />} />
              <Route path="/:chainId" element={<TrendingPage />} />
              <Route path="/:chainId/:tokenAddress" element={<TokenPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/pumpfun" element={<PumpFunPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </MainLayout>

          <SearchModal
            isOpen={isSearchModalOpen}
            onClose={() => setSearchModalOpen(false)}
          />

          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setLoginModalOpen(false)}
            onSwitchToRegister={() => {
              setLoginModalOpen(false);
              setRegisterModalOpen(true);
            }}
          />

          <RegisterModal
            isOpen={isRegisterModalOpen}
            onClose={() => setRegisterModalOpen(false)}
            onSwitchToLogin={() => {
              setRegisterModalOpen(false);
              setLoginModalOpen(true);
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
