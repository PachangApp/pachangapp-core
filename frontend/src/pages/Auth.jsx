import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo_pachangapp.png";
import CaptchaGrid from "../components/CaptchaGrid";
import { supabase, buildUserPayload } from "../lib/supabase";

// ─────────────────────────────────────────────────────────────
//  Helper: guardar sesión en localStorage con el mismo formato
//  que usaba el backend de Spring Boot (compatibilidad total)
// ─────────────────────────────────────────────────────────────
const saveUserToStorage = async (supabaseUser) => {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", supabaseUser.id)
    .single();

  const payload = buildUserPayload(supabaseUser, profile);
  localStorage.setItem("user", JSON.stringify(payload));
  return payload;
};

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(location.pathname === "/login");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [loginData,    setLoginData]    = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", email: "", password: "", confirmPassword: "" });

  const [message,       setMessage]       = useState("");
  const [error,         setError]         = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  useEffect(() => {
    setIsLogin(location.pathname === "/login");
    setMessage("");
    setError(false);
    setIsCaptchaValid(false);
  }, [location.pathname]);

  // ── Escuchar cambios de sesión de Supabase (para el OAuth de Google) ──
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const payload = await saveUserToStorage(session.user);
          setError(false);
          setMessage("¡Acceso exitoso! Bienvenido " + (payload.username || payload.email));
          setTimeout(() => navigate("/inicio"), 1200);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [navigate]);

  const toggleAuth = () => navigate(isLogin ? "/register" : "/login");

  // ─────────────────────────────────────────────────────────────
  //  LOGIN CON EMAIL + CONTRASEÑA
  // ─────────────────────────────────────────────────────────────
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
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email:    loginData.email,
        password: loginData.password,
      });

      if (authError) {
        setError(true);
        // Mensajes amigables en español
        if (authError.message.includes("Invalid login credentials")) {
          setMessage("Credenciales inválidas. Revisa tu email y contraseña.");
        } else if (authError.message.includes("Email not confirmed")) {
          setMessage("Tu cuenta no está activada. Revisa tu correo para confirmarla.");
        } else {
          setMessage(authError.message);
        }
        return;
      }

      const payload = await saveUserToStorage(data.user);
      setMessage("¡Inicio de sesión exitoso! Bienvenido " + (payload.username || payload.email));
      setTimeout(() => navigate("/inicio"), 1200);
    } catch {
      setError(true);
      setMessage("Error inesperado al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  //  REGISTRO CON EMAIL + CONTRASEÑA
  // ─────────────────────────────────────────────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError(false);

    // Validación de contraseñas
    if (registerData.password !== registerData.confirmPassword) {
      setError(true);
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(registerData.password)) {
      setError(true);
      setMessage("La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.");
      return;
    }

    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email:    registerData.email,
        password: registerData.password,
        options: {
          data: {
            full_name: registerData.username,
          },
          emailRedirectTo: `${window.location.origin}/#/verify`,
        },
      });

      if (signUpError) {
        setError(true);
        if (signUpError.message.includes("already registered")) {
          setMessage("El correo electrónico ya está registrado.");
        } else {
          setMessage(signUpError.message);
        }
        return;
      }

      setMessage(
        "¡Registro exitoso! Te hemos enviado un email de confirmación. " +
        "Activa tu cuenta antes de iniciar sesión."
      );
      setTimeout(() => navigate("/login"), 3000);
    } catch {
      setError(true);
      setMessage("Error inesperado al registrar la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  //  LOGIN CON GOOGLE (OAuth nativo de Supabase)
  // ─────────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setMessage("");
    setError(false);
    setLoading(true);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/#/inicio`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (oauthError) {
        setError(true);
        setMessage("Error al conectar con Google: " + oauthError.message);
        setLoading(false);
      }
      // Si todo va bien, Supabase redirige automáticamente
      // y el onAuthStateChange captura la sesión
    } catch {
      setError(true);
      setMessage("Error inesperado con Google.");
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative flex bg-white overflow-hidden font-['Inter',sans-serif]">

      {/* Background Blobs */}
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

        {/* PANEL VERDE — Desktop Only */}
        <motion.div
          initial={false}
          animate={{ x: isLogin ? "0%" : "150%" }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="hidden lg:flex flex-col justify-between w-2/5 p-12 relative z-30 shadow-2xl"
          style={{ background: "linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)" }}
        >
          <div className="flex items-center gap-3 opacity-0" />

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
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-0" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 text-emerald-700">
                  {isLogin ? "Crear una cuenta" : "Ya tengo cuenta"}
                </div>
              </button>
            </motion.div>
          </AnimatePresence>

          <p className="text-emerald-200 text-sm font-medium opacity-60">© 2025 PachangApp · TFG</p>
        </motion.div>

        {/* FORMULARIOS */}
        <motion.div
          animate={{ x: isDesktop ? (isLogin ? "0%" : "-66.66%") : "0%" }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="flex flex-1 items-start lg:items-center justify-center px-8 py-6 lg:py-8 bg-white relative z-20 overflow-y-auto"
        >
          <div className="w-full max-w-md relative">

            {/* Logo Mobile */}
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
                /* ── LOGIN FORM ── */
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
                        onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                        value={loginData.email}
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-black text-gray-700 uppercase tracking-wider">Contraseña</label>
                        <button type="button" onClick={() => navigate("/forgot-password")} className="text-xs text-emerald-600 font-bold hover:underline">
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>
                      <input
                        type="password" name="password" required
                        placeholder=""
                        className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-gray-900"
                        onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                        value={loginData.password}
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
                        ${!isCaptchaValid ? "bg-gray-400 opacity-60 cursor-not-allowed" : "bg-emerald-600 shadow-xl shadow-emerald-600/30 hover:bg-emerald-700"}`}
                    >
                      {loading ? "Iniciando..." : "Entrar →"}
                    </motion.button>

                    <div className="flex items-center my-4">
                      <div className="flex-grow border-t border-gray-200" />
                      <span className="px-4 text-gray-400 font-medium text-sm">o continúa con</span>
                      <div className="flex-grow border-t border-gray-200" />
                    </div>

                    {/* Botón Google propio — no depende de @react-oauth/google */}
                    <div className={`transition-opacity duration-300 ${!isCaptchaValid ? "opacity-50 pointer-events-none" : ""}`}>
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading || !isCaptchaValid}
                        className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold text-gray-700 shadow-sm"
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continuar con Google
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                /* ── REGISTER FORM ── */
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
                        onChange={e => setRegisterData({ ...registerData, username: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Email</label>
                      <input
                        type="email" name="email" required
                        placeholder="tu@email.com"
                        className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-gray-900"
                        onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Contraseña</label>
                      <input
                        type="password" name="password" required
                        placeholder="Min. 8 caracteres, 1 mayúscula, 1 número"
                        className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-gray-900"
                        onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wider">Confirmar contraseña</label>
                      <input
                        type="password" name="confirmPassword" required
                        placeholder="********"
                        className="w-full px-5 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all font-medium text-gray-900"
                        onChange={e => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
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
                      <div className="flex-grow border-t border-gray-200" />
                      <span className="px-4 text-gray-400 font-medium text-sm">o regístrate con</span>
                      <div className="flex-grow border-t border-gray-200" />
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 py-3 px-5 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold text-gray-700 shadow-sm disabled:opacity-50"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Registrarse con Google
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feedback */}
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
