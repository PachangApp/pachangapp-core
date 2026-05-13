import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const BottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { name: t("navbar.home"), path: "/inicio", icon: "🏠" },
    { name: t("navbar.explore"), path: "/explorar", icon: "🔍" },
    { name: t("navbar.create"), path: "/crear-partido", icon: "+", isPrimary: true },
    { name: t("navbar.torneos"), path: "/torneos", icon: "🏆" },
    { name: t("navbar.profile"), path: "/perfil", icon: "👤" },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-stretch pb-safe z-[100] md:hidden min-h-[85px] overflow-visible px-2">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;

        if (item.isPrimary) {
          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 pb-1 relative transition-all active:scale-95"
            >
              {/* Botón flotante circular, cortado al medio por el borde del footer. 
                  h-15 w-15 (60px). -top-[30px] lo posiciona exactamente en la mitad de la línea.
                  border-white simula el corte visual sobre el borde gris del navbar. */}
              <div className="absolute -top-[30px] bg-emerald-600 text-white h-[60px] w-[60px] rounded-full shadow-[0_4px_12px_rgba(16,185,129,0.35)] text-3xl font-medium flex items-center justify-center border-[4px] border-white z-10 transition-transform">
                <span className="mb-1 leading-none">{item.icon}</span>
              </div>
              
              {/* El texto se alinea en la misma línea base que los demás textos gracias al h-full y pb-2 uniformes */}
              <span className={`text-[10px] whitespace-nowrap mt-7 ${isActive ? "text-emerald-600 font-bold" : "text-gray-400 font-medium"}`}>
                {item.name}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
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
