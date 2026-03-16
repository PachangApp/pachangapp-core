import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { name: "Inicio", path: "/inicio" },
    { name: "Buscar partidos", path: "/partidos" },
    { name: "Perfil", path: "/perfil" },
    { name: "Conócenos", path: "/conocenos" },
    { name: "Campos disponibles", path: "/campos" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">P</span>
            </div>
            <span className="text-gray-900 font-bold text-xl tracking-tight hidden sm:block">
              PachangApp
            </span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`${
                  isActive(link.path)
                    ? "text-emerald-600 font-semibold"
                    : "text-gray-500 hover:text-emerald-600 font-medium"
                } text-sm transition-colors`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Section (provisional) */}
          <div className="flex items-center gap-3">
            <Link to="/perfil" className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                {/* Icono de usuario simple */}
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
