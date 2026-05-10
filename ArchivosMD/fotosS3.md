# Guía de Implementación: Persistencia de Fotos con Amazon S3 🚀

Para evitar que las fotos de perfil desaparezcan al reiniciar tu laboratorio de AWS (Kubernetes), la mejor solución es delegar el almacenamiento a **Amazon S3**. Aquí tienes los pasos exactos para implementarlo.

---

## 1. Configuración en la Consola de AWS ☁️

### A. Crear el Bucket de S3
1. Ve al servicio **S3** y haz clic en **Create bucket**.
2. Dale un nombre único (ej: `pachangapp-uploads-prod`).
3. En **Object Ownership**, selecciona **ACLs enabled** (esto facilita que las fotos sean públicas para que otros las vean).
4. **Bloqueo de acceso público**: Desmarca la casilla "Block all public access" si quieres que las fotos se vean directamente por URL (solo para este proyecto académico).

### B. Configurar CORS (Crucial para el Frontend)
En la pestaña **Permissions** del bucket, busca **Cross-origin resource sharing (CORS)** y añade esto:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### C. Usuario IAM (Credenciales)
1. Ve a **IAM** -> **Users** -> **Create user**.
2. Llámalo `pachangapp-s3-user`.
3. Adjunta la política: `AmazonS3FullAccess` (o crea una específica para tu bucket).
4. En **Security credentials**, crea una **Access Key** y guarda bien el `Access Key ID` y el `Secret Access Key`.

---

## 2. Configuración en el Backend (Spring Boot) ☕

### A. Añadir Dependencia
En tu `pom.xml`, añade el SDK de AWS:
```xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.20.0</version>
</dependency>
```

### B. Variables de Entorno (`application.properties`)
No pongas las claves directamente en el código. Úsalas como variables de entorno en Kubernetes:
```properties
aws.s3.bucket.name=nombre-de-tu-bucket
aws.access.key=TU_ACCESS_KEY
aws.secret.key=TU_SECRET_KEY
aws.region=us-east-1
```

### C. Lógica del Servicio de Subida
Crea un `S3Service.java` que use el `S3Client` para subir el archivo:
```java
// Resumen de la lógica:
public String uploadFile(MultipartFile file) {
    String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
    PutObjectRequest putOb = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(fileName)
            .acl(ObjectCannedACL.PUBLIC_READ) // Para que sea visible por URL
            .build();
    s3Client.putObject(putOb, RequestBody.fromBytes(file.getBytes()));
    return "https://" + bucketName + ".s3.amazonaws.com/" + fileName;
}
```

---

## 3. Flujo de Datos Final 🔄

1. **Frontend**: El usuario selecciona una foto y el frontend la envía al Backend mediante un `FormData`.
2. **Backend**:
   - Recibe el archivo.
   - Lo sube a S3 usando el `S3Service`.
   - **S3** devuelve la URL pública.
   - El Backend guarda esa **URL** en el campo `foto_perfil` de la tabla `users` en tu base de datos (RDS).
3. **Persistencia**: Cuando el laboratorio se apaga, la base de datos RDS mantiene la URL y el Bucket de S3 mantiene el archivo. Al volver a encender, la foto sigue ahí.

---

## 4. Ventajas para tu Proyecto de Grado 🏆
- **Escalabilidad**: Tu aplicación ya no depende del disco duro del servidor.
- **Profesionalismo**: Es el estándar de la industria (Cloud Native).
- **Seguridad**: Puedes rotar las claves de acceso sin tocar el código.

> [!TIP]
> Si no quieres que el Bucket sea público por seguridad, puedes usar **Presigned URLs**, que son URLs temporales que caducan en unos minutos, pero para empezar, el acceso público (Public Read) es lo más sencillo.
