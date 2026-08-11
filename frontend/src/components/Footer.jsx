import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo_pachangapp.png";

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-900 pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Columna 1: Branding */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="PachangApp Logo" className="w-10 h-10 object-contain" />
              <span className="text-2xl font-black tracking-tight text-white">
                Pachang<span className="text-emerald-500">App</span>
              </span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              La plataforma integral para organizar tus pachangas de fútbol, reservar pistas de pádel y disputar torneos con amigos. Potenciada por IA.
            </p>
            <div className="flex items-center gap-3 text-xs text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Servidores Activos en España (.es)
            </div>
          </div>

          {/* Columna 2: Navegación Rápida */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Navegación</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/buscar-partidos" className="hover:text-emerald-400 transition-colors">
                  Buscar Partidos
                </Link>
              </li>
              <li>
                <Link to="/buscar-jugadores" className="hover:text-emerald-400 transition-colors">
                  Buscar Jugadores
                </Link>
              </li>
              <li>
                <Link to="/torneos" className="hover:text-emerald-400 transition-colors">
                  Torneos & Ligas
                </Link>
              </li>
              <li>
                <Link to="/crear-partido" className="hover:text-emerald-400 transition-colors">
                  Crear Partido
                </Link>
              </li>
              <li>
                <Link to="/conocenos" className="hover:text-emerald-400 transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Información Legal */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Legal & RGPD</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/politica-privacidad" className="hover:text-emerald-400 transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/terminos-condiciones" className="hover:text-emerald-400 transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link to="/politica-cookies" className="hover:text-emerald-400 transition-colors">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <a
                  href="mailto:contacto@pachangapp.es"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Contacto & Soporte
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 4: Seguridad y Confianza */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Seguridad & Garantía</h4>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Sitio web protegido con cifrado SSL de 256 bits e infraestructura segura. Cumplimiento estricto con la LOPDGDD y el RGPD europeo.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs font-medium text-gray-300">
              <span>🔒 HTTPS Encriptado</span>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} PachangApp. Todos los derechos reservados. Registrado en pachangapp.es</p>
          <div className="flex items-center gap-6">
            <Link to="/politica-privacidad" className="hover:text-gray-400 transition-colors">Privacidad</Link>
            <Link to="/terminos-condiciones" className="hover:text-gray-400 transition-colors">Aviso Legal</Link>
            <Link to="/politica-cookies" className="hover:text-gray-400 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
