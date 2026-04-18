import React from "react";
import { motion } from "framer-motion";

const Counter = ({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max, 
  step = 1, 
  className = "", 
  size = "md",
  color = "gray",
  labelAlign = "left"
}) => {
  const handleDecrement = () => {
    const newVal = Math.max(min, Number(value) - step);
    onChange(step % 1 !== 0 ? parseFloat(newVal.toFixed(2)) : newVal);
  };

  const handleIncrement = () => {
    const baseVal = Number(value) + step;
    const newVal = max !== undefined ? Math.min(max, baseVal) : baseVal;
    onChange(step % 1 !== 0 ? parseFloat(newVal.toFixed(2)) : newVal);
  };

  const handleInputChange = (e) => {
    const val = e.target.value === "" ? "" : parseFloat(e.target.value);
    onChange(val);
  };

  const isLarge = size === "lg";

  // Mapeo de colores para la etiqueta
  const labelColorClass = {
    black: "text-gray-950 font-black",
    emerald: "text-emerald-600",
    gray: "text-gray-400 font-bold"
  }[color] || "text-gray-400 font-bold";

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className={`block text-xs uppercase tracking-widest mb-1.5 ${
          labelAlign === 'center' ? 'text-center w-full' : 'ml-1'
        } ${labelColorClass}`}>
          {label}
        </label>
      )}
      <div className={`flex items-center bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition-all ${isLarge ? 'p-3' : 'p-2.5'}`}>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDecrement}
          disabled={value <= min}
          className={`shrink-0 flex items-center justify-center bg-white shadow-sm text-emerald-600 rounded-xl disabled:opacity-30 disabled:grayscale transition-all ${
            isLarge ? 'w-12 h-12' : 'w-8 h-8'
          }`}
        >
          <svg className={isLarge ? "w-6 h-6" : "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" />
          </svg>
        </motion.button>
        
        <div className="flex-1 flex items-center justify-center px-2 min-w-[2.5rem]">
            <input
                type="number"
                value={value}
                onChange={handleInputChange}
                step={step}
                min={min}
                max={max}
                className={`w-full bg-transparent text-center font-black text-gray-900 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    isLarge ? 'text-3xl' : 'text-lg'
                }`}
            />
            {step % 1 !== 0 && <span className="text-xs text-emerald-600 font-black ml-0.5">€</span>}
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleIncrement}
          disabled={max !== undefined && value >= max}
          className={`shrink-0 flex items-center justify-center bg-white shadow-sm text-emerald-600 rounded-xl disabled:opacity-30 disabled:grayscale transition-all ${
            isLarge ? 'w-12 h-12' : 'w-8 h-8'
          }`}
        >
          <svg className={isLarge ? "w-6 h-6" : "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
};

export default Counter;
