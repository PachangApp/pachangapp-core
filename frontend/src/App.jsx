import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Inicio from "./pages/Inicio";
import Perfil from "./pages/Perfil";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/perfil" element={<Perfil />} />
      </Routes>
    </Router>
  );
}

export default App;