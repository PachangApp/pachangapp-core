import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Inicio from "./pages/Inicio";
import Perfil from "./pages/Perfil";
import BuscarPartidos from "./pages/BuscarPartidos";
import CamposDisponibles from "./pages/CamposDisponibles";
import CrearPartido from "./pages/CrearPartido";
import Conocenos from "./pages/Conocenos";
import ChatBot from "./components/ChatBot";
import MatchDetail from "./pages/MatchDetail";
import BottomNav from "./components/home/BottomNav";
import { useLocation } from "react-router-dom";

// Componente Wrapper para manejar la lógica de navegación global
const AppContent = () => {
  const location = useLocation();
  const storedUser = localStorage.getItem("user");
  
  // No mostrar BottomNav en estas rutas
  const hideNavPaths = ["/", "/login", "/register"];
  const shouldShowNav = !hideNavPaths.includes(location.pathname) && storedUser;

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/buscar-partidos" element={<BuscarPartidos />} />
        <Route path="/crear-partido" element={<CrearPartido />} />
        <Route path="/campos-disponibles" element={<CamposDisponibles />} />
        <Route path="/conocenos" element={<Conocenos />} />
        <Route path="/partido/:id" element={<MatchDetail />} />
      </Routes>
      <ChatBot />
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