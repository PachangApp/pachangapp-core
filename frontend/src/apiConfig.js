// Detectamos si estamos en la App de Capacitor (móvil) o en el navegador del PC
const isCapacitor = window.location.protocol === 'capacitor:' || !!window.Capacitor?.isNativePlatform();

// Tu IP de red local (para el móvil)
const PC_IP = "192.168.18.156";
const PORT = "8091";

// Si es móvil usamos la IP, si es navegador de PC usamos localhost
export const API_BASE_URL = isCapacitor 
  ? `http://${PC_IP}:${PORT}/api` 
  : `http://localhost:${PORT}/api`;
