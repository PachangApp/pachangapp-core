import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { API_BASE_URL } from "../apiConfig";
import logo from "../assets/logo pachangapp.png";


const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError(false);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        setError(false);
        const userData = await response.json();
        localStorage.setItem("user", JSON.stringify(userData));
        setMessage("¡Inicio de sesión exitoso! Bienvenido " + (userData.username || userData.email));
        // Redirigir al inicio después de un corto retraso para mostrar el mensaje
        setTimeout(() => {
          navigate("/inicio");
        }, 1500);
      } else {
        const errorData = await response.text();
        setError(true);
        setMessage(errorData || "Error al iniciar sesión.");
      }
    } catch (err) {
      console.error("Error detallado de conexión:", err);
      setError(true);
      setMessage("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="min-h-screen flex bg-white"
    >
      {/* Panel izquierdo - decorativo */}
      <div
        className="hidden lg:flex flex-col justify-between w-2/5 p-12"
        style={{
          background: "linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)",
        }}
      >
        <div className="flex flex-col items-center text-center w-full">
            <img src={logo} alt="Logo" className="w-full max-w-[450px] h-auto object-contain mb-2" />
        </div>

        <div>
          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Bienvenido de nuevo, <br />
            <span style={{ color: "#6ee7b7" }}>¡A jugar!</span>
          </h2>
          <p className="text-emerald-100 text-base leading-relaxed opacity-90">
            Accede a tu cuenta para organizar tus partidos, unirte a equipos y disfrutar de la comunidad.
          </p>

          {/* Dots decorativos */}
          <div className="flex gap-2 mt-10">
            <span className="w-2 h-1 rounded-full bg-emerald-300 opacity-60"></span>
            <span className="w-8 h-1 rounded-full bg-white"></span>
            <span className="w-2 h-1 rounded-full bg-emerald-300 opacity-60"></span>
          </div>
        </div>

        <p className="text-emerald-200 text-sm">© 2025 PachangApp · TFG</p>
      </div>

      {/* Panel derecho - formulario */}
      <div className="flex flex-1 items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-base">P</span>
            </div>
            <span className="text-gray-800 font-bold text-xl">PachangApp</span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
            Iniciar sesión
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-emerald-600 font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </p>

          {/* Mensaje de feedback */}
          {message && (
            <div
              className={`flex items-start gap-3 p-4 rounded-xl mb-6 text-sm font-medium
                ${error
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
            >
              <span>{error ? "⚠️" : "✅"}</span>
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                placeholder="ej: anonimo@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all duration-200"
                onChange={handleChange}
                value={formData.email}
                required
              />
            </div>

            {/* Campo Contraseña */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Contraseña
                </label>
                <a href="#" className="text-xs text-emerald-600 hover:underline font-medium">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <input
                type="password"
                name="password"
                placeholder="Tu contraseña secreta"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all duration-200"
                onChange={handleChange}
                value={formData.password}
                required
              />
            </div>

            {/* Botón de login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white text-sm font-bold tracking-wide transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              style={{
                background: loading
                  ? "#6ee7b7"
                  : "linear-gradient(135deg, #059669, #047857)",
                boxShadow: "0 4px 15px rgba(5, 150, 105, 0.35)",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
              }}
            >
              {loading ? "Iniciando sesión..." : "Entrar →"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
