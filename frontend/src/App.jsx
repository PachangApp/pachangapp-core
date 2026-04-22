import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Inicio from "./pages/Inicio";
import Perfil from "./pages/Perfil";
import BuscarPartidos from "./pages/BuscarPartidos";
import Torneos from "./pages/Torneos";
import TorneoDetail from "./pages/TorneoDetail";
import CrearTorneo from "./pages/CrearTorneo";
import CrearPartido from "./pages/CrearPartido";
import Conocenos from "./pages/Conocenos";
import ChatBot from "./components/ChatBot";
import MatchDetail from "./pages/MatchDetail";
import Admin from "./pages/Admin";
import BottomNav from "./components/home/BottomNav";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

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
  const hideNavPaths = ["/", "/login", "/register"];
  const shouldShowNav = !hideNavPaths.includes(location.pathname) && storedUser;

  // No mostrar PachanBot en login/register o hero antes de entrar
  const shouldShowBot = storedUser && !["/login", "/register", "/"].includes(location.pathname);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/buscar-partidos" element={<BuscarPartidos />} />
        <Route path="/crear-partido" element={<CrearPartido />} />
        <Route path="/torneos" element={<Torneos />} />
        <Route path="/torneos/:id" element={<TorneoDetail />} />
        <Route path="/crear-torneo" element={<CrearTorneo />} />
        <Route path="/conocenos" element={<Conocenos />} />
        <Route path="/partido/:id" element={<MatchDetail />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      {shouldShowBot && <ChatBot />}
      {shouldShowNav && <BottomNav />}
    </>
  );
};
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;