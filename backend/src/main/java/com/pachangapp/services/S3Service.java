package com.pachangapp.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

    @Value("${aws.s3.bucket.name:pachangapp-uploads}")
    private String bucketName;

    @Value("${aws.access.key:}")
    private String accessKey;

    @Value("${aws.secret.key:}")
    private String secretKey;

    @Value("${aws.session.token:}")
    private String sessionToken;

    @Value("${aws.region:us-east-1}")
    private String region;

    public String uploadFile(MultipartFile file) throws IOException {
        software.amazon.awssdk.auth.credentials.AwsCredentialsProvider credentialsProvider;

        // Si hay llaves configuradas (ej: para pruebas locales), las usamos
        if (accessKey != null && !accessKey.isEmpty() && secretKey != null && !secretKey.isEmpty()) {
            if (sessionToken != null && !sessionToken.isEmpty()) {
                credentialsProvider = StaticCredentialsProvider.create(
                        software.amazon.awssdk.auth.credentials.AwsSessionCredentials.create(accessKey, secretKey, sessionToken));
            } else {
                credentialsProvider = StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey));
            }
        } else {
            // MODO AUTOMÁTICO: Si no hay llaves, usa el rol del laboratorio de AWS (LabRole)
            // Esto es lo que hará que funcione siempre en tu despliegue sin tocar nada
            credentialsProvider = software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider.create();
        }

        S3Client s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider)
                .build();

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename().replaceAll("\\s+", "_");

        PutObjectRequest putOb = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .acl(ObjectCannedACL.PUBLIC_READ)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putOb, RequestBody.fromBytes(file.getBytes()));

        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);
    }
}
