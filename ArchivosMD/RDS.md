# Plan de Despliegue: Base de Datos Centralizada y AWS S3

¡Excelentes noticias! Analizando tu código en la carpeta `k8s/`, **ya tienes resuelto el problema de la base de datos centralizada**.

## 1. La Base de Datos (Ya la tienes hecha)
En tu archivo `k8s/mysql.yaml` estás utilizando un `PersistentVolumeClaim` (PVC) de 5GB. 
¿Qué significa esto? Que cuando GitHub Actions despliega tu app (`kubectl apply -f k8s/`), Kubernetes está levantando un MySQL dentro de tu instancia EC2 y guardando los datos en el disco duro virtual del servidor.
Como ambos accedéis a `pachangapp.es` (que apunta a esa misma instancia a través de la Elastic IP), **ya estáis viendo exactamente la misma base de datos**. No necesitas RDS.

**Único requisito:** Asegúrate de que en tu `k8s/backend.yaml`, la variable de entorno de conexión apunte a `mysql-service`:
```yaml
- name: SPRING_DATASOURCE_URL
  value: jdbc:mysql://mysql-service:3306/pachangapp
```

---

## 2. Configurar AWS S3 para las Imágenes (El Reto)

En el entorno de AWS Learner Lab, las credenciales cambian cada 4 horas. Para que tu aplicación no se caiga por culpa de credenciales caducadas, usaremos el **Rol de la Instancia (IAM Role)**.

### Paso 2.1: Crear el Bucket en S3
1. Ve a la consola de AWS -> S3 -> **Create bucket**.
2. Nombre: `pachangapp-imagenes` (tiene que ser único a nivel mundial).
3. **Object Ownership**: Deja "ACLs disabled".
4. **Block Public Access settings for this bucket**: **DESMARCA** la casilla "Block all public access" (necesitamos que los avatares se vean en la web). Acepta la advertencia.
5. Crea el bucket.
6. Entra al bucket -> Pestaña **Permissions** -> Baja hasta **Bucket policy** y dale a Edit. Pega esto (cambiando el nombre del bucket):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::pachangapp-imagenes/*"
        }
    ]
}
```

### Paso 2.2: Darle permisos a tu Servidor EC2
Para no usar las contraseñas temporales que caducan:
1. Ve a **EC2** -> Selecciona tu instancia -> Arriba dale a **Actions** -> **Security** -> **Modify IAM role**.
2. Despliega la lista y selecciona el rol de laboratorio (suele llamarse `LabInstanceProfile` o parecido).
3. Guarda. *Nota: Este rol ya tiene permisos para acceder a S3 dentro del Learner Lab.*

### Paso 2.3: Configurar tu Backend (Spring Boot)
Como el EC2 ya tiene el rol, Spring Boot detectará los permisos automáticamente.

**A) Añade la dependencia a tu `pom.xml`:**
```xml
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
</dependency>
```

**B) Configura la región y el bucket en `application.properties`:**
```properties
aws.s3.bucket=pachangapp-imagenes
aws.s3.region=us-east-1 # o la región de tu laboratorio
```

**C) Crea un Servicio para S3 (`S3Service.java`):**
Crea una clase en tu backend que reciba los archivos (por ejemplo de un formulario web) y los suba usando el SDK. 
*Como el EC2 tiene el rol IAM, no hace falta que le pases claves en el código.*
```java
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.core.sync.RequestBody;
import org.springframework.stereotype.Service;

@Service
public class S3Service {
    private final S3Client s3Client;
    private final String bucketName = "pachangapp-imagenes";

    public S3Service() {
        this.s3Client = S3Client.builder().build(); // Detecta credenciales del EC2 solo
    }

    public String subirArchivo(String nombreArchivo, byte[] contenido) {
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(nombreArchivo)
                .build();
        
        s3Client.putObject(request, RequestBody.fromBytes(contenido));
        
        return "https://" + bucketName + ".s3.amazonaws.com/" + nombreArchivo;
    }
}
```

### 3. ¿Cómo funciona todo junto?
1. Un usuario sube su foto de perfil en `pachangapp.es`.
2. El frontend envía la foto a tu backend.
3. El backend usa `S3Service` para guardarla en el bucket `pachangapp-imagenes`.
4. S3 te devuelve la URL pública (`https://pachangapp-imagenes.s3.amazonaws.com/avatar1.jpg`).
5. Guardas **esa URL** en tu base de datos MySQL (que vive en tu EC2).
6. ¡Listo! Cualquier usuario (tú o tu compañero) verá las imágenes directamente servidas por los servidores súper rápidos de Amazon S3, y los datos compartidos de la base de datos de tu instancia EC2.
