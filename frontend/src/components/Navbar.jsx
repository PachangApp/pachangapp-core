import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo_pachangapp.png";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  React.useEffect(() => {
    const syncUser = () => {
      setUser(JSON.parse(localStorage.getItem("user") || "null"));
    };
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setShowLogoutModal(false);
    navigate("/");
  };

  const navLinks = [
    { name: t("navbar.home"), path: "/inicio" },
    { name: t("navbar.profile"), path: "/perfil" },
    { 
      name: t("navbar.explore"), 
      isDropdown: true,
      children: [
        { name: t("navbar.search_matches"), path: "/buscar-partidos" },
        { name: t("navbar.search_players"), path: "/buscar-jugadores" }
      ]
    },
    { name: t("navbar.create_match"), path: "/crear-partido" },
    { name: t("navbar.torneos"), path: "/torneos" },
    { name: t("navbar.about_us"), path: "/conocenos" },
    ...(user?.role === 'ROLE_ADMIN' ? [{ name: t("navbar.admin"), path: "/admin" }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 pt-[env(safe-area-inset-top)] transition-all">
      {/* 1. MÓVIL: Header Corto y Limpio (Replicado de Inicio) */}
      <div className="md:hidden flex justify-between items-center px-4 py-1">
        <Link to="/inicio" className="flex items-center">
          <img src={logo} alt="PachangApp Logo" className="w-[80px] h-[80px] object-contain" />
        </Link>
        <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSelector />
            {user?.role === 'ROLE_ADMIN' && (
              <Link to="/admin" className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </Link>
            )}
            <Link to="/perfil" className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-100 shadow-sm">
                <img 
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=10b981&color=fff`} 
                    className="w-full h-full object-cover"
                    alt="Perfil"
                />
            </Link>
            
            <button
                onClick={handleLogout}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-600 transition-all active:scale-95"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>
        </div>
      </div>

      {/* 2. DESKTOP: Navegación Completa */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/inicio" className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-[72px] h-[72px] object-contain transition-transform hover:scale-110" />
            <span className="text-emerald-600 font-black text-xl tracking-tight">
              PachangApp
            </span>
          </Link>

          {/* Links para Desktop */}
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              link.isDropdown ? (
                <div key={link.name} className="relative group">
                  <button className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors">
                    {link.name}
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 min-w-[200px] flex flex-col gap-1">
                      {link.children.map(child => (
                        <Link
                          key={child.name}
                          to={child.path}
                          className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center gap-3 ${
                            isActive(child.path) 
                              ? "bg-emerald-50 text-emerald-700 font-bold" 
                              : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
                          }`}
                        >
                          {child.path === "/buscar-partidos" ? "⚽" : "👥"}
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`${
                    isActive(link.path)
                      ? "text-emerald-600 font-bold"
                      : "text-gray-500 hover:text-emerald-600 font-medium"
                  } text-sm transition-colors relative group whitespace-nowrap`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <motion.div 
                      layoutId="nav-active"
                      className="absolute -bottom-5.5 left-0 right-0 h-0.5 bg-emerald-600"
                    />
                  )}
                </Link>
              )
            ))}
          </div>

          <div className="flex items-center gap-3">
              <ThemeToggle />
              <LanguageSelector />
              
              <Link 
                to="/perfil" 
                className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border-2 transition-all ${
                  isActive("/perfil") ? "border-emerald-500 bg-emerald-50" : "border-gray-100 bg-gray-50 hover:border-emerald-200"
                }`}
              >
                <img 
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=10b981&color=fff`} 
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
                <span>{t("navbar.logout")}</span>
              </button>
          </div>
        </div>
      </div>
    </nav>
    <AnimatePresence>
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border border-gray-100"
            >
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </div>
                
                <h3 className="text-xl font-black text-gray-900 mb-2">¿Cerrar sesión?</h3>
                <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                    Seguro que desea salir de PachangApp? <br/>¡Te esperaremos para la próxima!
                </p>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={confirmLogout}
                        className="w-full py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95"
                    >
                        Sí, cerrar sesión
                    </button>
                    <button 
                        onClick={() => setShowLogoutModal(false)}
                        className="w-full py-4 bg-emerald-50 text-emerald-700 font-black rounded-2xl hover:bg-emerald-100 transition-all active:scale-95"
                    >
                        No, me quedo
                    </button>
                </div>
            </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
};

export default Navbar;
