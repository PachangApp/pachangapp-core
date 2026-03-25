import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Inicio from "./pages/Inicio";
import Perfil from "./pages/Perfil";
import BuscarPartidos from "./pages/BuscarPartidos";
import CamposDisponibles from "./pages/CamposDisponibles";
import CrearPartido from "./pages/CrearPartido";
import Conocenos from "./pages/Conocenos";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/buscar-partidos" element={<BuscarPartidos />} />
        <Route path="/crear-partido" element={<CrearPartido />} />
        <Route path="/campos-disponibles" element={<CamposDisponibles />} />
        <Route path="/conocenos" element={<Conocenos />} />
      </Routes>
    </Router>
  );
}

export default App;