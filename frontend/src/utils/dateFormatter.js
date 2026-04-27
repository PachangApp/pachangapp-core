/**
 * Convierte una fecha en formato YYYY-MM-DD a DD/MM/YYYY.
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {string} - Fecha formateada o el string original si no es válido
 */
export const formatDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return dateString;
  
  // Si ya tiene el formato DD/MM/YYYY o similar (contiene /), lo devolvemos
  if (dateString.includes('/')) return dateString;

  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;

  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

/**
 * Recibe un objeto Date o un string ISO y devuelve DD/MM/YYYY.
 */
export const formatDateObj = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};
