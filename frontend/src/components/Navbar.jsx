import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const navLinks = [
    { name: "Inicio", path: "/inicio" },
    { name: "Perfil", path: "/perfil" },
    { name: "Buscar partidos", path: "/buscar-partidos" },
    { name: "Crear partido", path: "/crear-partido" },
    { name: "Conócenos", path: "/conocenos" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 pt-[env(safe-area-inset-top)] transition-all">
      {/* 1. MÓVIL: Header Corto y Limpio (Replicado de Inicio) */}
      <div className="md:hidden flex justify-between items-center p-4">
        <div>
          <h1 className="text-xl font-black text-emerald-600 tracking-tight">PachangApp ⚽</h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
            {storedUser ? `¡Hola ${storedUser.username}!` : "Bienvenido"}
          </p>
        </div>
        <div className="flex items-center gap-3">
            <button className="relative p-2 bg-gray-50 rounded-full text-gray-400 hover:text-emerald-600 transition-all active:scale-90">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <Link to="/perfil" className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-100 shadow-sm">
                <img 
                    src={storedUser?.avatar || `https://ui-avatars.com/api/?name=${storedUser?.username || 'U'}&background=10b981&color=fff`} 
                    className="w-full h-full object-cover"
                    alt="Perfil"
                />
            </Link>
        </div>
      </div>

      {/* 2. DESKTOP: Navegación Completa */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/inicio" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center transition-transform hover:scale-110">
              <span className="text-white font-black text-sm">P</span>
            </div>
            <span className="text-gray-900 font-black text-xl tracking-tight">
              PachangApp
            </span>
          </Link>

          {/* Links para Desktop */}
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`${
                  isActive(link.path)
                    ? "text-emerald-600 font-bold"
                    : "text-gray-500 hover:text-emerald-600 font-medium"
                } text-sm transition-colors relative group`}
              >
                {link.name}
                {isActive(link.path) && (
                  <motion.div 
                    layoutId="nav-active"
                    className="absolute -bottom-[22px] left-0 right-0 h-0.5 bg-emerald-600"
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
              <Link 
                to="/perfil" 
                className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border-2 transition-all ${
                  isActive("/perfil") ? "border-emerald-500 bg-emerald-50" : "border-gray-100 bg-gray-50 hover:border-emerald-200"
                }`}
              >
                <img 
                    src={storedUser?.avatar || `https://ui-avatars.com/api/?name=${storedUser?.username || 'U'}&background=10b981&color=fff`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                />
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all font-bold text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Salir</span>
              </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
