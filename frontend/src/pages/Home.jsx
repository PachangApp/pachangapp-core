import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Componente para el balón animado (optimizado para no causar lag)
const SoccerBall = () => (
  <motion.svg
    width="100"
    height="100"
    viewBox="0 0 100 100"
    initial={{ y: 0, rotate: 0, opacity: 0 }}
    animate={{ 
      y: [0, -20, 0],
      rotate: 360,
      opacity: 0.1,
    }}
    transition={{ 
      y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
      rotate: { duration: 15, repeat: Infinity, ease: "linear" },
      opacity: { duration: 1 }
    }}
    className="absolute top-10 right-[15%] pointer-events-none hidden md:block text-emerald-600"
  >
    <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M50 2L50 15M50 85L50 98M2 50L15 50M85 50L98 50" stroke="currentColor" strokeWidth="2" />
    <path d="M25 25L35 35M65 65L75 75M25 75L35 65M65 25L75 35" stroke="currentColor" strokeWidth="2" />
    <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
  </motion.svg>
);

const Home = () => {
  // Variantes con duraciones más cortas para evitar sensación de lag
  const logoVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.5, ease: "easeOut" } 
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.5, delay: 0.2, ease: "easeOut" } 
    },
  };

  const itemsBottomVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.5, delay: 0.4, ease: "easeOut" } 
    },
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-50 overflow-hidden font-['Inter',_sans-serif]">
      
      {/* Fondos dinámicos simplificados */}
      <motion.div 
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-200 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div 
        animate={{ opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-300 rounded-full blur-[120px] pointer-events-none"
      />

      <SoccerBall />

      <div className="relative z-10 flex flex-col items-center px-6 w-full max-w-4xl">
        
        {/* 1. LOGO: Viene desde ARRIBA */}
        <motion.div 
          variants={logoVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-4 mb-10"
        >
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-600/30">
            <span className="text-white font-black text-3xl">P</span>
          </div>
          <span className="text-gray-900 font-black text-4xl tracking-tight">PachangApp</span>
        </motion.div>
        
        {/* 2. TÍTULO: Aparece desde el MEDIO */}
        <motion.h1 
          variants={titleVariants}
          initial="hidden"
          animate="visible"
          className="text-5xl md:text-7xl font-black text-gray-900 mb-6 text-center tracking-tight leading-tight"
        >
          El fútbol se vive <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500">
            en comunidad.
          </span>
        </motion.h1>
        
        {/* 3. DESCRIPCIÓN Y BOTONES: Vienen desde ABAJO */}
        <motion.div
          variants={itemsBottomVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center w-full"
        >
          <p className="text-gray-500 text-xl md:text-2xl mb-12 max-w-2xl text-center leading-relaxed">
            Organiza y encuentra tus pachangas. Juega, compite y diviértete.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 w-full max-w-md">
            <Link to="/login" className="flex-1">
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="px-8 py-5 rounded-2xl bg-emerald-600 text-white font-bold text-lg text-center shadow-xl shadow-emerald-600/20 cursor-pointer"
              >
                Iniciar sesión
              </motion.div>
            </Link>
            
            <Link to="/register" className="flex-1">
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="px-8 py-5 rounded-2xl bg-white text-emerald-600 font-bold text-lg text-center border-2 border-emerald-100 shadow-lg cursor-pointer"
              >
                Registrarse
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 text-gray-400 text-sm font-bold tracking-widest uppercase"
      >
        Ready?
      </motion.div>
    </div>
  );
};

export default Home;

