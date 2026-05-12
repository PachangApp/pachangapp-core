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

    @org.springframework.beans.factory.annotation.Autowired
    private S3Service s3Service;

    @org.springframework.beans.factory.annotation.Value("${aws.access.key:}")
    private String awsAccessKey;

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

        // Si tenemos configurado S3, lo usamos para persistencia real
        if (awsAccessKey != null && !awsAccessKey.isEmpty()) {
            try {
                return s3Service.uploadFile(file);
            } catch (Exception e) {
                System.err.println("Error subiendo a S3: " + e.getMessage());
                // Fallback al almacenamiento local si falla S3 (opcional)
            }
        }

        // Almacenamiento local (Efímero en contenedores)
        Path root = Paths.get(uploadDir);
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String sanitizedFilename = originalFilename.replaceAll("[^a-zA-Z0-9.\\-]", "_");
        
        String filename = UUID.randomUUID().toString() + "_" + sanitizedFilename;
        Files.copy(file.getInputStream(), root.resolve(filename));

        return filename;
    }
}
