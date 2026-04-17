import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const DatePicker = ({ label, value, onChange, minDate, placeholder = "Seleccionar fecha", className = "", clearable = false }) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Parse current date or selected date
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  
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

  // Helpers for localized names
  const getMonthNames = () => {
    return [...Array(12).keys()].map(m => 
      new Intl.DateTimeFormat(i18n.language, { month: 'long' }).format(new Date(2024, m, 1))
    );
  };

  const getDayNames = () => {
    // Start with Monday as per usual European/Standard preference, or let Intl decide
    // For simplicity and matching common UI, we use Mo, Tu...
    const baseDate = new Date(2024, 0, 1); // This was a Monday
    return [...Array(7).keys()].map(d => 
      new Intl.DateTimeFormat(i18n.language, { weekday: 'short' }).format(new Date(2024, 0, 1 + d))
    );
  };

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust so Monday is 0
  };

  const monthNames = getMonthNames();
  const dayNames = getDayNames();

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleSelectDay = (day) => {
    // Usamos el año, mes y día actuales de la vista para evitar desfases de zona horaria
    const y = currentYear;
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const formatted = `${y}-${m}-${d}`;
    
    onChange(formatted);
    setIsOpen(false);
  };

  const clearDate = (e) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
  };

  const isToday = (day) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  };

  const isSelected = (day) => {
    if (!value) return false;
    const d = new Date(value);
    // Adjusted because value is YYYY-MM-DD (UTC-ish)
    // To avoid timezone issues with pure ISO strings, we parse carefully
    const [y, m, dayVal] = value.split('-').map(Number);
    return dayVal === day && (m - 1) === currentMonth && y === currentYear;
  };

  const isDisabled = (day) => {
    if (!minDate) return false;
    const [minY, minM, minD] = minDate.split('-').map(Number);
    const min = new Date(minY, minM - 1, minD);
    const current = new Date(currentYear, currentMonth, day);
    return current < min;
  };

  // Generate days array
  const totalDays = daysInMonth(currentYear, currentMonth);
  const paddingDays = startDayOfMonth(currentYear, currentMonth);
  const days = [];
  for (let i = 0; i < paddingDays; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  // Label display - Parse value locally for the label too
  const getDisplayValue = () => {
    if (!value) return placeholder;
    const [y, m, d] = value.split('-').map(Number);
    const day = String(d).padStart(2, '0');
    const month = String(m).padStart(2, '0');
    return `${day}/${month}/${y}`;
  };

  const displayValue = getDisplayValue();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 border-2 transition-all rounded-2xl group ${
          isOpen ? "border-emerald-500 bg-white shadow-lg shadow-emerald-500/5" : "border-transparent hover:border-gray-200"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <svg className={`w-5 h-5 shrink-0 ${isOpen ? "text-emerald-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={`font-bold truncate ${value ? "text-gray-900" : "text-gray-400"}`}>
            {displayValue}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {clearable && value && (
            <div 
              onClick={clearDate}
              className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
              title="Limpiar fecha"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
          )}
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            className={`w-5 h-5 transition-colors ${isOpen ? "text-emerald-500" : "text-gray-400"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </motion.svg>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute lg:right-0 z-50 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 w-72 md:w-80"
          >
            {/* Header: Month/Year and navigation */}
            <div className="flex items-center justify-between mb-4">
              <button 
                type="button" 
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-emerald-600 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
              </button>
              
              <div className="text-sm font-black text-gray-900 uppercase tracking-widest">
                {monthNames[currentMonth]} <span className="text-emerald-600 ml-1">{currentYear}</span>
              </div>

              <button 
                type="button" 
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-emerald-600 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>

            {/* Day Names Row */}
            <div className="grid grid-cols-7 mb-2">
              {dayNames.map(d => (
                <div key={d} className="text-[10px] font-black text-gray-300 uppercase text-center py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                if (day === null) return <div key={`pad-${idx}`} />;
                
                const disabled = isDisabled(day);
                const active = isSelected(day);
                const today = isToday(day);

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelectDay(day)}
                    className={`
                      relative py-2 text-sm font-bold rounded-xl transition-all flex items-center justify-center
                      ${disabled ? "text-gray-200 cursor-not-allowed" : "hover:bg-gray-50 text-gray-700"}
                      ${active ? "!bg-emerald-600 !text-white shadow-lg shadow-emerald-200" : ""}
                      ${today && !active ? "text-emerald-600" : ""}
                    `}
                  >
                    {day}
                    {today && !active && (
                      <div className="absolute bottom-1 w-1 h-1 bg-emerald-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
            
            {clearable && (
              <div className="mt-4 pt-3 border-t border-gray-50 text-center">
                 <button 
                    type="button" 
                    onClick={clearDate}
                    className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                 >
                    {i18n.language === 'es' ? 'Limpiar fecha' : 'Clear date'}
                 </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatePicker;
