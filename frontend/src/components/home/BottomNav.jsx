import React from "react";
import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { name: "Inicio", path: "/inicio", icon: "🏠" },
    { name: "Explorar", path: "/buscar-partidos", icon: "🔍" },
    { name: "Crear", path: "/crear-partido", icon: "+", isPrimary: true },
    { name: "Campos", path: "/campos-disponibles", icon: "🏟️" },
    { name: "Perfil", path: "/perfil", icon: "👤" },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-2 pb-safe z-50 md:hidden">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;

        if (item.isPrimary) {
          return (
            <div key="primary-action" className="flex flex-col items-center justify-center -translate-y-4">
              <Link
                to={item.path}
                className="bg-emerald-600 text-white h-14 w-14 rounded-full shadow-[0_4px_12px_rgba(16,185,129,0.4)] text-2xl font-bold flex items-center justify-center"
              >
                {item.icon}
              </Link>
            </div>
          );
        }

        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center w-16 transition-colors ${
              isActive ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className={`text-2xl mb-1 ${isActive ? "scale-110 transition-transform" : ""}`}>
              {item.icon}
            </span>
            <span className={`text-[10px] whitespace-nowrap ${isActive ? "font-bold" : "font-medium"}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
