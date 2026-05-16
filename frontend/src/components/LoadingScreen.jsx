import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ text = "Cargando..." }) => {
  return (
    <div className="flex flex-col items-center justify-center grow w-full font-sans py-20 min-h-[60vh]">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-emerald-600/10 rounded-full animate-pulse"></div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-black text-emerald-600 tracking-tight italic uppercase">PachangApp</h2>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest animate-pulse text-center px-4">
            {text}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
