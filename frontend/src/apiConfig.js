// Detectamos si estamos en la App de Capacitor (móvil) o en el navegador del PC
const isCapacitor = window.location.protocol === 'capacitor:' || !!window.Capacitor?.isNativePlatform();

// Tu IP de red local (para el móvil)
const PC_IP = "192.168.18.156";
const PORT = "8091";

// Si es móvil usamos la IP, si es navegador de PC usamos localhost
const isProduction = window.location.hostname === 'pachangapp.es' || window.location.hostname === 'www.pachangapp.es';

// Si es móvil usamos la IP, si es producción usamos el subdominio, si es local usamos localhost
export const API_BASE_URL = isProduction
  ? 'https://api.pachangapp.es/api'
  : isCapacitor 
    ? `http://${PC_IP}:${PORT}/api` 
    : `http://localhost:${PORT}/api`;

export const N8N_TRANSLATE_URL = 'https://n8n.pachangapp.es/webhook/translate';
