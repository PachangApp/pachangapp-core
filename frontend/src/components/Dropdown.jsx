import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Dropdown = ({ label, options, value, onChange, placeholder = "Seleccionar", className = "" }) => {
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

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 border-2 transition-all rounded-2xl group cursor-pointer ${
          isOpen ? "border-emerald-500 bg-white shadow-lg shadow-emerald-500/5" : "border-transparent hover:border-gray-200"
        }`}
      >
        <span className={`font-bold transition-colors ${value ? "text-gray-900" : "text-gray-400"}`}>
          {options.find(opt => typeof opt === 'object' ? opt.value === value : opt === value)?.label || value || placeholder}
        </span>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          className={`w-5 h-5 transition-colors ${isOpen ? "text-emerald-500" : "text-gray-400"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl p-2 max-h-60 overflow-y-auto"
          >
            {options.map((option, idx) => {
              const opValue = typeof option === 'object' ? option.value : option;
              const opLabel = typeof option === 'object' ? option.label : option;
              
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(opValue)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between group cursor-pointer ${
                    value === opValue 
                      ? "bg-emerald-50 text-emerald-600" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {opLabel}
                  {value === opValue && (
                    <motion.div layoutId="check" className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;
