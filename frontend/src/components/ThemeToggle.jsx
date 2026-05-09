import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Función para formatear el texto (añadir <br/> si es necesario o manejar el espacio)
  const formatText = (text) => {
    const parts = text.split(' ');
    if (parts.length >= 2) {
      return (
        <>
          {parts[0]}<br/>{parts.slice(1).join(' ')}
        </>
      );
    }
    return text;
  };

  return (
    <div
      onClick={toggleTheme}
      className={`
        relative w-22 h-10 flex items-center px-1 rounded-full cursor-pointer transition-all duration-500
        ${isDark ? "bg-slate-900 border-slate-800 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]" : "bg-gray-100 border-gray-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"}
        border
      `}
    >
      {/* Texto de fondo */}
      <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none select-none">
        <div 
          className={`text-[8px] font-black leading-tight transition-all duration-500 w-12 text-center
          ${isDark ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0 text-gray-400"}`}
        >
          {formatText(t('navbar.theme_light_short'))}
        </div>
        <div 
          className={`text-[8px] font-black leading-tight transition-all duration-500 w-12 text-center
          ${isDark ? "opacity-100 translate-x-0 text-slate-500" : "opacity-0 translate-x-2"}`}
        >
          {formatText(t('navbar.theme_dark_short'))}
        </div>
      </div>

      {/* Círculo deslizante */}
      <motion.div
        animate={{
          x: isDark ? 0 : 48,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30
        }}
        className={`
          z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500
          ${isDark 
            ? "bg-slate-800 text-slate-100 shadow-[2px_2px_10px_rgba(0,0,0,0.4),-1px_-1px_2px_rgba(255,255,255,0.05)]" 
            : "bg-white text-gray-400 shadow-[2px_2px_5px_rgba(0,0,0,0.1),-1px_-1px_2px_rgba(255,255,255,0.5)]"}
        `}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {isDark ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
            </svg>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ThemeToggle;
