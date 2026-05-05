import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { API_BASE_URL } from "../apiConfig";
import logo from "../assets/logo_pachangapp.png";
import CaptchaGrid from "../components/CaptchaGrid";

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Sincronizar el estado con la URL
  const [isLogin, setIsLogin] = useState(location.pathname === "/login");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Efecto para detectar tamaño de pantalla
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Estado para Login
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  // Estado para Register
  const [registerData, setRegisterData] = useState({ username: "", email: "", password: "", confirmPassword: "" });

  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  // Actualizar el estado isLogin si cambia la URL externamente
  useEffect(() => {
    setIsLogin(location.pathname === "/login");
    setMessage(""); // Limpiar mensajes al cambiar
    setError(false);
    setIsCaptchaValid(false);
  }, [location.pathname]);

  const toggleAuth = () => {
    const newPath = isLogin ? "/register" : "/login";
    navigate(newPath);
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!isCaptchaValid) {
      setError(true);
      setMessage("Por favor, completa el CAPTCHA para continuar.");
      return;
    }
    setMessage("");
    setError(false);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const userData = await response.json();
        localStorage.setItem("user", JSON.stringify(userData));
        setMessage("¡Inicio de sesión exitoso! Bienvenido " + (userData.username || userData.email));
        setTimeout(() => navigate("/inicio"), 1500);
      } else {
        const errorData = await response.text();
        setError(true);
        setMessage(errorData || "Error al iniciar sesión.");
      }
    } catch {
      setError(true);
      setMessage("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError(false);

    if (registerData.password !== registerData.confirmPassword) {
      setError(true);
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      if (response.ok) {
        setMessage("¡Usuario registrado con éxito! Ya puedes iniciar sesión.");
        // Opcional: auto-swap a login
        setTimeout(() => navigate("/login"), 2000);
      } else {
        const errorData = await response.text();
        setError(true);
        setMessage(errorData || "Error al registrar el usuario.");
      }
    } catch {
      setError(true);
      setMessage("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuthSuccess = async (credentialResponse) => {
    setMessage("");
    setError(false);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/google-auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: credentialResponse.credential
        }),
      });

      if (response.ok) {
        setError(false);
        const userData = await response.json();
        localStorage.setItem("user", JSON.stringify(userData));
        setMessage("¡Acceso exitoso! Bienvenido " + (userData.username || userData.email));
        setTimeout(() => navigate("/inicio"), 1500);
      } else {
        const errorData = await response.text();
        setError(true);
        setMessage(errorData || "Error de autenticación con Google.");
      }
    } catch {
      setError(true);
      setMessage("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex bg-white overflow-hidden font-['Inter',sans-serif]">
      
      {/* Background Blobs (Optimized) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ x: isLogin ? 0 : 100, opacity: [0.03, 0.06, 0.03] }}
          className="absolute -top-24 -left-24 w-160 h-160 bg-emerald-200 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ x: isLogin ? 0 : -100, opacity: [0.03, 0.06, 0.03] }}
          className="absolute -bottom-24 -right-24 w-160 h-160 bg-emerald-300 rounded-full blur-[120px]" 
        />
      </div>

      <div className="relative flex w-full min-h-screen z-10 flex-col lg:flex-row">
        
        {/* PANEL VERDE (OVERLAY) - Desktop Only */}
        <motion.div
          initial={false}
          animate={{ 
            x: isLogin ? "0%" : "150%", // Se mueve de 0 a 60% del ancho total (2/5 = 40%, 3/5 = 60%)
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="hidden lg:flex flex-col justify-between w-2/5 p-12 relative z-30 shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)",
          }}
        >
          <div className="flex items-center gap-3 opacity-0">
             {/* Espaciador para mantener estructura si es necesario o simplemente eliminar */}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login-text" : "register-text"}
              initial={{ opacity: 0, scale: 0.9, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center text-center w-full"
            >
              <img src={logo} alt="Logo" className="w-full max-w-[450px] h-auto object-contain mb-8 drop-shadow-2xl" />
              <h2 className="text-white text-4xl font-extrabold leading-tight mb-6">
                {isLogin ? (
                  <>Bienvenido de nuevo, <br /><span className="text-emerald-300 font-black">¡A jugar!</span></>
                ) : (
                  <>El fútbol se vive <br /><span className="text-emerald-300 font-black">en comunidad.</span></>
                )}
              </h2>
              <p className="text-emerald-100 text-lg leading-relaxed opacity-90 mb-10">
                {isLogin 
                  ? "Accede a tu cuenta para organizar tus partidos y disfrutar de la comunidad." 
                  : "Únete a miles de jugadores. Encuentra partidas, organiza equipos y demuestra tu nivel."}
              </p>
              
              <button 
                onClick={toggleAuth}
                className="group relative px-8 py-3 rounded-xl border-2 border-emerald-400 text-white font-bold overflow-hidden"
              >
                <span className="relative z-10">{isLogin ? "Crear una cuenta" : "Ya tengo cuenta"}</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 text-emerald-700">
                  {isLogin ? "Crear una cuenta" : "Ya tengo cuenta"}
                </div>
              </button>
            </motion.div>
          </AnimatePresence>

          <p className="text-emerald-200 text-sm font-medium opacity-60">© 2025 PachangApp · TFG</p>
        </motion.div>

        {/* CONTENEDOR DE FORMULARIOS */}
        <motion.div
          animate={{ 
            x: isDesktop ? (isLogin ? "0%" : "-66.66%") : "0%",
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="flex flex-1 items-start lg:items-center justify-center px-8 py-6 lg:py-8 bg-white relative z-20 overflow-y-auto"
        >
          <div className="w-full max-w-md relative">
            
            {/* Logo Mobile Animado */}
            <motion.div 
              layout
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col items-center mb-4 lg:hidden w-full shrink-0"
            >
              <img src={logo} alt="Logo" className="w-[140px] h-[140px] object-contain mb-0" />
            </motion.div>

            <AnimatePresence mode="wait">
              {isLogin ? (
                /* LOGIN FORM */
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Iniciar sesión</h1>
                  <p className="text-gray-500 font-medium mb-6">
                    ¿No tienes cuenta?{" "}
                    <button onClick={toggleAuth} className="text-emerald-600 font-bold hover:underline">Regístrate aquí</button>
                  </p>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Correo electrónico</label>
                      <input
                        type="email" name="email" required
                        placeholder="ej: anonimo@email.com"
                        className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-gray-900"
                        onChange={handleLoginChange} value={loginData.email}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-black text-gray-700 uppercase tracking-wider">Contraseña</label>
                        <a href="#" className="text-xs text-emerald-600 font-bold hover:underline">¿Olvidaste tu contraseña?</a>
                      </div>
                      <input
                        type="password" name="password" required
                        placeholder=""
                        className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-gray-900"
                        onChange={handleLoginChange} value={loginData.password}
                      />
                    </div>
                    
                    {/* Captcha */}
                    <div className="pt-2">
                      <CaptchaGrid onSuccess={() => setIsCaptchaValid(true)} />
                    </div>

                    <motion.button
                      whileHover={isCaptchaValid ? { scale: 1.02 } : {}}
                      whileTap={isCaptchaValid ? { scale: 0.98 } : {}}
                      type="submit" disabled={loading || !isCaptchaValid}
                      className={`w-full py-3.5 rounded-xl font-black text-lg transition-all mt-2 text-white
                        ${!isCaptchaValid ? 'bg-gray-400 opacity-60 cursor-not-allowed' : 'bg-emerald-600 shadow-xl shadow-emerald-600/30 hover:bg-emerald-700'}`}
                    >
                      {loading ? "Iniciando..." : "Entrar →"}
                    </motion.button>
                    
                    <div className="flex items-center my-4">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <span className="px-4 text-gray-400 font-medium text-sm">o continúa con</span>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    <div className="flex justify-center w-full">
                      <div className={`w-full transition-opacity duration-300 ${!isCaptchaValid ? 'opacity-50 pointer-events-none' : ''}`} title={!isCaptchaValid ? "Completa el CAPTCHA primero" : ""}>
                        <GoogleLogin
                          onSuccess={handleGoogleAuthSuccess}
                          onError={() => {
                            setError(true);
                            setMessage('Error conectando con Google.');
                          }}
                          useOneTap
                          theme="outline"
                          size="large"
                          shape="rectangular"
                          width="100%"
                        />
                      </div>
                    </div>
                  </form>
                </motion.div>
              ) : (
                /* REGISTER FORM */
                <motion.div
                  key="register-form"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Crear cuenta</h1>
                  <p className="text-gray-500 font-medium mb-6">
                    ¿Ya tienes cuenta?{" "}
                    <button onClick={toggleAuth} className="text-emerald-600 font-bold hover:underline">Inicia sesión</button>
                  </p>

                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Usuario</label>
                      <input
                        type="text" name="username" required
                        placeholder="Tu nombre Futbolero"
                        className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-gray-900"
                        onChange={handleRegisterChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Email</label>
                      <input
                        type="email" name="email" required
                        placeholder="tu@email.com"
                        className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-gray-900"
                        onChange={handleRegisterChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Contraseña</label>
                      <input
                        type="password" name="password" required
                        placeholder="********"
                        className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-gray-900"
                        onChange={handleRegisterChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Confirmar contraseña</label>
                      <input
                        type="password" name="confirmPassword" required
                        placeholder="********"
                        className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-gray-900"
                        onChange={handleRegisterChange}
                      />
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit" disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-black text-lg shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all disabled:opacity-50 mt-4"
                    >
                      {loading ? "Registrando..." : "Crear cuenta →"}
                    </motion.button>

                    <div className="flex items-center my-4">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <span className="px-4 text-gray-400 font-medium text-sm">o regístrate con</span>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    <div className="flex justify-center w-full">
                      <GoogleLogin
                        onSuccess={handleGoogleAuthSuccess}
                        onError={() => {
                          setError(true);
                          setMessage('Error conectando con Google.');
                        }}
                        useOneTap
                        theme="outline"
                        size="large"
                        shape="rectangular"
                        width="100%"
                      />
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feedback Message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`mt-8 p-4 rounded-2xl text-sm font-black flex items-center gap-4 shadow-sm border ${
                    error ? "bg-red-50 text-red-700 border-red-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                  }`}
                >
                  <span className="text-xl">{error ? "⚠️" : "✅"}</span>
                  {message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Auth;
