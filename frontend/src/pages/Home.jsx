import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 font-['Inter',_sans-serif]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-black text-xl">P</span>
        </div>
        <span className="text-gray-800 font-bold text-3xl">PachangApp</span>
      </div>
      
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
        ¡Bienvenido a PachangApp!
      </h1>
      <p className="text-gray-600 text-lg mb-8 max-w-lg text-center leading-relaxed">
        El lugar donde el deporte que te gusta está siempre cerca. Encuentra tu próxima partida y diviértete.
      </p>

      <div className="flex gap-4">
        <Link 
          to="/login"
          className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/30"
        >
          Iniciar sesión
        </Link>
        <Link 
          to="/register"
          className="px-6 py-3 rounded-xl bg-white text-emerald-600 font-bold border border-emerald-200 hover:bg-emerald-50 transition-colors"
        >
          Registrarse
        </Link>
      </div>
    </div>
  );
};

export default Home;
