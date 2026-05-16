import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = "Confirmar", 
    cancelText = "Cancelar",
    type = "danger" 
}) => {
    const isDanger = type === "danger";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Card */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-8 shadow-2xl overflow-hidden"
                    >
                        {/* Decorative Top Bar - Always Emerald as requested */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-emerald-500 to-teal-500" />
                        
                        <div className="flex flex-col items-center text-center">
                            {/* Icon Circle */}
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-inner ${isDanger ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'}`}>
                                {isDanger ? (
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                ) : (
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight uppercase">
                                {title}
                            </h3>
                            
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8 px-2">
                                {message}
                            </p>
                            
                            <div className="flex w-full gap-3">
                                <button 
                                    onClick={onClose}
                                    className="flex-1 px-4 py-4 font-bold text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-2xl transition-all uppercase text-[10px] tracking-widest border border-gray-100 dark:border-slate-800 cursor-pointer"
                                >
                                    {cancelText}
                                </button>
                                <button 
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={`flex-[1.5] px-4 py-4 text-white font-black rounded-2xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] uppercase text-[10px] tracking-widest cursor-pointer ${
                                        isDanger 
                                        ? 'bg-red-600 shadow-red-200 dark:shadow-none hover:bg-red-700' 
                                        : 'bg-emerald-600 shadow-emerald-200 dark:shadow-none hover:bg-emerald-700'
                                    }`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
