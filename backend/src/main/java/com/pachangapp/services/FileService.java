package com.pachangapp.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileService {

    private final String uploadDir = "uploads";
    private final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList("image/jpeg", "image/png", "image/jpg");

    public String saveFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("No se puede subir un archivo vacío.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("El archivo supera el tamaño máximo permitido de 5MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Solo se permiten imágenes (JPG, PNG).");
        }

        Path root = Paths.get(uploadDir);
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        // Sanitizar el nombre del archivo para evitar caracteres extraños o problemas de seguridad
        String sanitizedFilename = originalFilename.replaceAll("[^a-zA-Z0-9.\\-]", "_");
        
        String filename = UUID.randomUUID().toString() + "_" + sanitizedFilename;
        Files.copy(file.getInputStream(), root.resolve(filename));

        // Devolvemos solo el nombre o la ruta relativa. 
        // El UploadController se encargará de construir la URL completa o la ruta /uploads/
        return filename;
    }
}
