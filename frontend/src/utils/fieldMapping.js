import cartujaImg from "../assets/campos/cartuja.jpg";
import fuentenuevaImg from "../assets/campos/Fuentenueva.jpg";
import fuentenuevaSalaImg from "../assets/campos/Fuentenueva_sala.jpg";

/**
 * Retorna la imagen correspondiente al nombre del campo.
 * @param {string} fieldName - El nombre del campo (ej: 'Cartuja - Fútbol 11')
 * @returns {string|null} - La ruta importada de la imagen o null si no hay coincidencia.
 */
export const getFieldImage = (fieldName) => {
  if (!fieldName) return null;
  
  const name = fieldName.toLowerCase();
  
  if (name.includes("cartuja")) {
    return cartujaImg;
  }
  
  if (name.includes("pabellón") || name.includes("sala") || name.includes("fuentenueva_sala")) {
    return fuentenuevaSalaImg;
  }
  
  if (name.includes("fuentenueva")) {
    return fuentenuevaImg;
  }
  
  return null;
};
