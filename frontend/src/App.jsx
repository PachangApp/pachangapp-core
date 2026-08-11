import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Inicio from "./pages/Inicio";
import Perfil from "./pages/Perfil";
import BuscarPartidos from "./pages/BuscarPartidos";
import Explorar from "./pages/Explorar";
import BuscarJugadores from "./pages/BuscarJugadores";
import Torneos from "./pages/Torneos";
import TorneoDetail from "./pages/TorneoDetail";
import CrearTorneo from "./pages/CrearTorneo";
import CrearPartido from "./pages/CrearPartido";
import Conocenos from "./pages/Conocenos";
import ChatBot from "./components/ChatBot";
import MatchDetail from "./pages/MatchDetail";
import Admin from "./pages/Admin";
import VerifyEmail from "./pages/VerifyEmail";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";
import TerminosCondiciones from "./pages/TerminosCondiciones";
import PoliticaCookies from "./pages/PoliticaCookies";
import BottomNav from "./components/home/BottomNav";
import SEOHead from "./components/SEOHead";
import CookieBanner from "./components/CookieBanner";
import Footer from "./components/Footer";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Componente Wrapper para manejar la lógica de navegación global
const AppContent = () => {
  const location = useLocation();
  const storedUser = localStorage.getItem("user");
  
  // No mostrar BottomNav en estas rutas
  const hideNavPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify", "/politica-privacidad", "/terminos-condiciones", "/politica-cookies"];
  const shouldShowNav = !hideNavPaths.includes(location.pathname) && storedUser;

  // No mostrar PachanBot en login/register o hero antes de entrar
  const shouldShowBot = storedUser && !["/login", "/register", "/", "/forgot-password", "/reset-password", "/verify"].includes(location.pathname);

  // Determinar si mostrar Footer global (no mostrar en login/register/verify/admin)
  const hideFooterPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/verify", "/admin"];
  const shouldShowFooter = !hideFooterPaths.includes(location.pathname);

  return (
    <>
      <SEOHead />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/explorar" element={<Explorar />} />
        <Route path="/buscar-partidos" element={<BuscarPartidos />} />
        <Route path="/buscar-jugadores" element={<BuscarJugadores />} />
        <Route path="/crear-partido" element={<CrearPartido />} />
        <Route path="/torneos" element={<Torneos />} />
        <Route path="/torneos/:id" element={<TorneoDetail />} />
        <Route path="/crear-torneo" element={<CrearTorneo />} />
        <Route path="/conocenos" element={<Conocenos />} />
        <Route path="/partido/:id" element={<MatchDetail />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/politica-privacidad" element={<PoliticaPrivacidad />} />
        <Route path="/terminos-condiciones" element={<TerminosCondiciones />} />
        <Route path="/politica-cookies" element={<PoliticaCookies />} />
      </Routes>
      {shouldShowBot && <ChatBot />}
      {shouldShowNav && <BottomNav />}
      {shouldShowFooter && <Footer />}
      <CookieBanner />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;