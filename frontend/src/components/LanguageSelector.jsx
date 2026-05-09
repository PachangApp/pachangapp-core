import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Definición de idiomas con las clases de flag-icons (fi-xx)
  const languages = [
    { code: 'es', short: 'ES', name: 'Español', flagClass: 'fi-es' },
    { code: 'en', short: 'EN', name: 'English', flagClass: 'fi-gb' }, // Usamos gb para inglés estándar
  ];

  const currentLanguage = languages.find((lng) => lng.code === i18n.language.split('-')[0]) || languages[0];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white border border-gray-100 hover:border-emerald-200 transition-all shadow-sm group"
      >
        <span className={`fi ${currentLanguage.flagClass} rounded-sm shrink-0 shadow-sm`}></span>
        <span className="hidden md:inline text-[13px] font-black text-gray-700 uppercase tracking-tight">
          {currentLanguage.short}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] p-1.5"
          >
            {languages.map((lng) => (
              <button
                key={lng.code}
                onClick={() => changeLanguage(lng.code)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-xl transition-all ${
                  currentLanguage.code === lng.code 
                    ? 'bg-emerald-50 text-emerald-700 font-black' 
                    : 'text-gray-600 hover:bg-gray-50 font-bold'
                }`}
              >
                <span className={`fi ${lng.flagClass} rounded-sm shrink-0 shadow-sm`}></span>
                <span className="uppercase tracking-wide">{lng.short}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;
