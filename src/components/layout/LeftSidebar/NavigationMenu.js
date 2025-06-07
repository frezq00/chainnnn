import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

const NavigationMenu = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="mt-8">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4">
        Navigation
      </h3>
      <nav className="space-y-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center px-4 py-2.5 text-sm rounded transition-colors ${
              isActive
                ? "bg-dex-bg-highlight text-dex-text-primary"
                : "text-dex-text-secondary hover:bg-dex-bg-highlight hover:text-dex-text-primary"
            }`
          }
        >
          <span className="mr-3 w-5 text-center">📈</span>
          Trending
        </NavLink>
        <NavLink
          to="/pumpfun"
          className={({ isActive }) =>
            `flex items-center px-4 py-2.5 text-sm rounded transition-colors ${
              isActive
                ? "bg-dex-bg-highlight text-dex-text-primary"
                : "text-dex-text-secondary hover:bg-dex-bg-highlight hover:text-dex-text-primary"
            }`
          }
        >
          <span className="mr-3 w-5 text-center">🚀</span>
          Pump.fun Tokens
        </NavLink>
        <NavLink
          to="/portfolio"
          className={({ isActive }) =>
            `flex items-center px-4 py-2.5 text-sm rounded transition-colors ${
              isActive
                ? "bg-dex-bg-highlight text-dex-text-primary"
                : "text-dex-text-secondary hover:bg-dex-bg-highlight hover:text-dex-text-primary"
            }`
          }
        >
          <span className="mr-3 w-5 text-center">💼</span>
          Portfolio
        </NavLink>
        {user && (
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 text-sm rounded transition-colors ${
                isActive
                  ? "bg-dex-bg-highlight text-dex-text-primary"
                  : "text-dex-text-secondary hover:bg-dex-bg-highlight hover:text-dex-text-primary"
              }`
            }
          >
            <span className="mr-3 w-5 text-center">⭐</span>
            Favorites
          </NavLink>
        )}
      </nav>
    </div>
  );
};

export default NavigationMenu;
