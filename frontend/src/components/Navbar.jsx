import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo_pachangapp.png";
import LanguageSelector from "./LanguageSelector";
import ThemeToggle from "./ThemeToggle";
import { API_BASE_URL } from "../apiConfig";

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isExploreOpen, setIsExploreOpen] = React.useState(false);
  const [invitationCount, setInvitationCount] = React.useState(0);

  const fetchInvitationCount = React.useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_BASE_URL}/invitaciones/count?userId=${user.id}`, {
        headers: { "Authorization": `Bearer ${user.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInvitationCount(data.count);
      }
    } catch (err) {
      console.error("Error fetching invitation count:", err);
    }
  }, [user]);

  React.useEffect(() => {
    fetchInvitationCount();
    const interval = setInterval(fetchInvitationCount, 30000); // Polling cada 30s
    return () => clearInterval(interval);
  }, [fetchInvitationCount]);

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
    { 
      name: t("navbar.home"), 
      path: "/inicio", 
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> 
    },
    { 
      name: t("navbar.profile"), 
      path: "/perfil", 
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> 
    },
    { 
      name: t("navbar.explore"), 
      isDropdown: true,
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>,
      children: [
        { name: t("navbar.search_matches"), path: "/buscar-partidos" },
        { name: t("navbar.search_players"), path: "/buscar-jugadores" }
      ]
    },
    { 
      name: t("navbar.create_match"), 
      path: "/crear-partido", 
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg> 
    },
    { 
      name: t("navbar.torneos"), 
      path: "/torneos", 
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> 
    },
    { 
      name: t("navbar.about_us"), 
      path: "/conocenos", 
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> 
    },
    ...(user?.role === 'ROLE_ADMIN' ? [{ 
      name: t("navbar.admin"), 
      path: "/admin",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
    {/* EL FONDO DE LA NAVBAR SE CAMBIA EN ESTA LÍNEA (className de <nav>) */}
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 pt-[env(safe-area-inset-top)] transition-all">
      {/* 1. MÓVIL Y TABLET: Header con Menú Hamburguesa */}
      <div className="xl:hidden flex justify-between items-center px-4 py-2 relative z-50">
        <Link to="/inicio" className="flex items-center gap-2">
          <img src={logo} alt="PachangApp Logo" className="w-[60px] h-[60px] object-contain" />
          <span className="text-emerald-600 font-black text-xl tracking-tighter leading-none hidden sm:block">PachangApp</span>
        </Link>
        <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSelector />
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-500 hover:text-emerald-600 transition-all rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden absolute w-full left-0 top-[100%] bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-900 overflow-hidden shadow-2xl z-40"
          >
            <div className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.isDropdown ? (
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => setIsExploreOpen(!isExploreOpen)}
                        className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between transition-colors hover:bg-gray-50 dark:hover:bg-slate-900 cursor-pointer`}
                      >
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                           <span className="text-xl opacity-70">{link.icon}</span>
                           {link.name}
                        </div>
                        <svg className={`w-4 h-4 transition-transform ${isExploreOpen ? 'rotate-180' : ''} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                      <AnimatePresence>
                        {isExploreOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-1 pt-1 pb-2">
                              {link.children.map(child => (
                                <Link
                                  key={child.name}
                                  to={child.path}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className={`ml-12 mr-4 py-2 px-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${
                                    isActive(child.path) ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-emerald-600"
                                  }`}
                                >
                                  <span className="text-lg opacity-70">{child.path === "/buscar-partidos" ? "⚽" : "👥"}</span>
                                  {child.name}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                      <Link
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors relative ${
                          isActive(link.path) ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-900 hover:text-emerald-600"
                        }`}
                      >
                        <span className="text-xl opacity-70">{link.icon}</span>
                        {link.name}
                        {link.path === "/perfil" && invitationCount > 0 && (
                          <span className="absolute left-7 top-2 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-pulse">
                            {invitationCount}
                          </span>
                        )}
                      </Link>
                  )}
                </div>
              ))}
              
              <div className="border-t border-gray-100 dark:border-slate-800 my-2 pt-4 flex flex-col gap-2">
                <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-slate-900/50 transition-colors">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                   {t("navbar.logout")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. DESKTOP: Navegación Completa (xl en adelante) */}
      <div className="hidden xl:block w-full px-4 xl:px-8">
        {/* Usamos un grid de 3 columnas para asegurar que el centro esté centrado sin solaparse */}
        <div className="grid grid-cols-[1fr_auto_1fr] h-20 items-center gap-4">
          
          {/* BLOQUE IZQUIERDA: Logo */}
          <div className="flex items-center justify-start min-w-0">
            <Link to="/inicio" className="flex items-center gap-2 group flex-shrink-0">
              <img src={logo} alt="Logo" className="w-16 h-16 object-contain transition-transform group-hover:scale-110" />
              <span className="text-emerald-600 font-black text-lg xl:text-xl tracking-tighter leading-none hidden 2xl:block">
                PachangApp
              </span>
            </Link>
          </div>

          {/* BLOQUE CENTRO: Links (Ahora fluyen naturalmente) */}
          <div className="flex items-center justify-center gap-1 2xl:gap-2 min-w-0">
            {navLinks.map((link) => (
              link.isDropdown ? (
                <div key={link.name} className="relative group">
                  <button className="flex items-center gap-1 px-2 2xl:px-4 py-2 text-sm font-bold text-gray-500 hover:text-emerald-600 transition-all rounded-xl hover:bg-gray-50 dark:hover:bg-slate-900 whitespace-nowrap cursor-pointer">
                    <span className="text-base 2xl:text-lg opacity-70">{link.icon}</span>
                    <span className="hidden xl:inline">{link.name}</span>
                    <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-2 min-w-[200px] flex flex-col gap-1">
                      {link.children.map(child => (
                        <Link
                          key={child.name}
                          to={child.path}
                          className={`px-4 py-3 rounded-xl text-sm font-bold transition-colors flex items-center gap-3 ${
                            isActive(child.path) 
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" 
                              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-emerald-600"
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
                    className={`px-2 2xl:px-4 py-2 rounded-xl text-sm transition-all whitespace-nowrap flex items-center gap-1 2xl:gap-2 group relative ${
                      isActive(link.path)
                        ? "bg-gray-50 dark:bg-slate-800 text-emerald-600 shadow-sm font-black"
                        : "text-gray-500 hover:text-emerald-600 font-bold hover:bg-gray-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <span className={`text-base 2xl:text-lg transition-transform group-hover:scale-110 ${isActive(link.path) ? "text-emerald-600" : "opacity-60"}`}>{link.icon}</span>
                    <span className="hidden xl:inline">{link.name}</span>
                    {link.path === "/perfil" && invitationCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-bounce">
                        {invitationCount}
                      </span>
                    )}
                  </Link>
              )
            ))}
          </div>

          {/* BLOQUE DERECHA: Herramientas */}
          <div className="flex items-center justify-end gap-2 2xl:gap-4 min-w-0">
              <div className="flex items-center gap-1 2xl:gap-2 pr-2 2xl:pr-4 border-r border-gray-100 dark:border-slate-800">
                <ThemeToggle />
                <LanguageSelector />
              </div>
              
              <div className="flex items-center gap-1 xl:gap-3">
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 2xl:w-10 xl:h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all group"
                  title={t("navbar.logout")}
                >
                  <svg className="w-5 h-5 2xl:w-6 2xl:h-6 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
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
