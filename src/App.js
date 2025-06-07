import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import TrendingPage from "./pages/TrendingPage";
import TokenPage from "./pages/TokenPage";
import SearchModal from "./components/modals/SearchModal";
import PortfolioPage from "./pages/PortfolioPage";
import PumpFunPage from "./pages/PumpFunPage";
import FavoritesPage from "./pages/FavoritesPage";
import AdminPage from "./pages/AdminPage";

const App = () => {
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <div className="bg-gray-900 text-white min-h-screen">
          <MainLayout openSearchModal={() => setSearchModalOpen(true)}>
            <Routes>
              <Route path="/" element={<TrendingPage />} />
              <Route path="/:chainId" element={<TrendingPage />} />
              <Route path="/:chainId/:tokenAddress" element={<TokenPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/pumpfun" element={<PumpFunPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </MainLayout>

          <SearchModal
            isOpen={isSearchModalOpen}
            onClose={() => setSearchModalOpen(false)}
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
