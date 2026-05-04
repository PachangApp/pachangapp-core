import { API_BASE_URL } from '../apiConfig';

/**
 * Sube una imagen al servidor usando el endpoint /api/upload
 * @param {File} file - El archivo de imagen a subir
 * @returns {Promise<string>} - La URL pública de la imagen subida
 */
export const uploadImage = async (file) => {
  if (!file) throw new Error("No hay archivo para subir.");

  // Validación de tamaño en frontend (5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("La imagen es demasiado grande. Máximo 5MB.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const token = storedUser.token;

  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: headers,
    body: formData
  });

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(errorMsg || "Error al subir la imagen");
  }

  // El backend devuelve la URL como texto plano o JSON. Nuestro UploadController devuelve String.
  const fileUrl = await response.text();
  return fileUrl;
};
