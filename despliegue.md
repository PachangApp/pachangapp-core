# Guía de Despliegue Profesional - PachangApp 🚀

Esta guía es el paso a paso detallado para cumplir al 100% el **Apartado 8 (Despliegue de Aplicaciones Web)** del `plan.md`. Cada fase explica qué hacer, dónde poner los archivos y por qué.

**Stack de despliegue:** AWS Educate (EC2 + Kubernetes K3s) · IONOS (dominio) · GitHub Actions (CI/CD) · Docker + Docker Compose · n8n (desde cero en contenedor)

---

## FASE 0 (Completada ✅): Documentación Automática de API (Swagger)

Ya añadiste la dependencia en `backend/pom.xml`. Al arrancar el backend, puedes verificar que funciona en: `http://localhost:8091/swagger-ui.html`

- **(Checkbox marcado: Documentación automática de código)**

---

## FASE 1: Docker — Contenedorizar todos los servicios

Necesitamos empaquetar cada pieza de la aplicación en un contenedor Docker independiente (Backend, Frontend, Base de Datos, n8n). Esto asegura que funcione igual en cualquier máquina (la tuya, la de tu compañero, o AWS).

### 1.1 Backend — `backend/Dockerfile` ✅ (ya creado)
```dockerfile
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8091
ENTRYPOINT ["java","-jar","app.jar"]
```
> ⚠️ **Importante:** Este `Dockerfile` necesita que el `.jar` ya esté construido. Se ejecuta con `mvn package -DskipTests` antes de hacer `docker build`.

### 1.2 Frontend — `frontend/Dockerfile` ✅ (ya creado)
```dockerfile
# Etapa 1: Construir la app React con Vite
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Servir los archivos estáticos con Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```
> El `EXPOSE 80` aquí es correcto y no hay que cambiarlo. Nginx siempre escucha en el puerto 80 por estándar. El frontend no necesita el puerto de tu backend (8091), solo el navegador del usuario le llama directamente.

### 1.3 n8n — No necesita Dockerfile propio
n8n tiene una imagen oficial publicada en Docker Hub. No hace falta crear un Dockerfile para él, simplemente la referenciamos en el `docker-compose.yml` del siguiente paso.

---

## FASE 2: Docker Compose — Levantar todo con un solo comando

**¿Por qué hace falta esto?** Es fundamental para el desarrollo. Permite que cualquier persona (tú, tu compañero, el tribunal) levante TODA la aplicación (Backend + Frontend + MySQL + n8n) con un único comando: `docker compose up`. Sin esto, hay que arrancar 4 cosas manualmente.

- **Dónde:** Crea el archivo `docker-compose.yml` en la **raíz del proyecto** (`PachangApp/docker-compose.yml`).
- **Qué pongo:**

```yaml
version: '3.8'

services:

  # Base de Datos MySQL
  db:
    image: mysql:8.0
    container_name: pachangapp-db
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: pachangapp
      MYSQL_USER: pachangapp_user
      MYSQL_PASSWORD: pachangapp_pass
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - pachangapp-net

  # Backend Spring Boot (requiere haber hecho mvn package antes)
  backend:
    build: ./backend
    container_name: pachangapp-backend
    ports:
      - "8091:8091"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://db:3306/pachangapp
      SPRING_DATASOURCE_USERNAME: pachangapp_user
      SPRING_DATASOURCE_PASSWORD: pachangapp_pass
    depends_on:
      - db
    networks:
      - pachangapp-net

  # Frontend React/Vite servido con Nginx
  frontend:
    build: ./frontend
    container_name: pachangapp-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - pachangapp-net

  # n8n — Plataforma de automatización de flujos
  n8n:
    image: docker.n8n.io/n8nio/n8n
    container_name: pachangapp-n8n
    ports:
      - "5678:5678"
    environment:
      N8N_HOST: localhost
      N8N_PORT: 5678
      N8N_PROTOCOL: http
      WEBHOOK_URL: http://localhost:5678/
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - pachangapp-net

volumes:
  mysql_data:
  n8n_data:

networks:
  pachangapp-net:
    driver: bridge
```

> ✅ Con este archivo, cualquier persona que clone el repo solo tiene que ejecutar:
> ```bash
> mvn package -DskipTests   # (solo para el backend)
> docker compose up --build
> ```
> Y tendrá la aplicación completa corriendo localmente.

---

## FASE 3: Configurar el Servidor en AWS Estudiante ☁️

El objetivo es tener una máquina Linux en la nube (como si fuera un PC siempre encendido en internet) donde desplegar el proyecto. Sigue estos pasos en orden exacto.

---

### PASO 3.1 — Acceder a tu consola de AWS

1. Ve a [https://aws.amazon.com/es/education/awseducate/](https://aws.amazon.com/es/education/awseducate/) e inicia sesión con tu cuenta de AWS Academy/Educate del instituto.
2. Una vez dentro, haz clic en **"AWS Console"** o **"Start Lab"** (depende de si es AWS Academy o Educate). Esto abre la consola real de AWS.
3. Asegúrate de que en la esquina superior derecha pone una región como **"eu-west-1" (Irlanda)** o **"us-east-1" (Virginia)**. Cámbiala si hace falta — lo importante es que sea siempre la misma durante todo el proyecto.

---

### PASO 3.2 — Crear la instancia EC2 (tu servidor en la nube)

1. En el buscador de la consola de AWS (barra superior), escribe **EC2** y haz clic en el primer resultado.
2. En el panel de EC2, haz clic en el botón naranja **"Lanzar instancia"** (o "Launch Instance").
3. Rellena el formulario que aparece **campo a campo**:

   **Nombre:**
   ```
   pachangapp-server
   ```

   **Imagen de la máquina (AMI):** Haz clic en "Examinar más AMIs" si no aparece Ubuntu. Busca:
   ```
   Ubuntu Server 22.04 LTS
   ```
   Selecciona la versión con arquitectura **x86_64** y que ponga "Free tier eligible".

   **Tipo de instancia:**  
   Selecciona `t3.medium` (2 vCPU / 4 GB RAM). Si tu cuenta educate solo te deja `t2.medium`, usa esa.  
   > ⚠️ NO uses `t2.micro` (1 GB de RAM) — Kubernetes no arranca con tan poca memoria.

   **Par de claves (Key Pair):**  
   Haz clic en **"Crear nuevo par de claves"**.
   - Nombre: `pachangapp-key`
   - Tipo: RSA
   - Formato: `.pem` (para Linux/Mac) o `.ppk` (para Windows con PuTTY)
   - Haz clic en **"Crear par de claves"** — se descargará automáticamente un archivo `pachangapp-key.pem`. **Guárdalo en un lugar seguro**, lo necesitarás para conectarte. Si lo pierdes, no podrás acceder al servidor.

   **Configuración de red (Security Groups) — MUY IMPORTANTE:**  
   Haz clic en "Editar" en esta sección. Verás que ya hay una regla para SSH (puerto 22). Debes **añadir** las siguientes reglas haciendo clic en "Agregar regla de seguridad":

   | Tipo | Protocolo | Rango de puertos | Origen |
   |------|-----------|-----------------|--------|
   | SSH | TCP | 22 | `0.0.0.0/0` (Tu IP es mejor, pero esto simplifica) |
   | HTTP | TCP | 80 | `0.0.0.0/0` |
   | HTTPS | TCP | 443 | `0.0.0.0/0` |
   | Personalizado TCP | TCP | 8091 | `0.0.0.0/0` |
   | Personalizado TCP | TCP | 5678 | `0.0.0.0/0` |
   | Personalizado TCP | TCP | 6443 | `0.0.0.0/0` |

   > El puerto 6443 es el que usa Kubernetes internamente para comunicar su API.

   **Almacenamiento:**  
   Cámbialo a **20 GB** mínimo (el valor por defecto suele ser 8 GB, que se queda corto con Docker + Kubernetes).

4. Haz clic en **"Lanzar instancia"**. Espera 1-2 minutos a que el estado cambie a **"En ejecución"** (Running).

---

### PASO 3.3 — Obtener la IP Pública de tu servidor

1. En el panel de EC2, haz clic en **"Instancias"** en el menú de la izquierda.
2. Haz clic en tu instancia `pachangapp-server`.
3. En la parte inferior verás los detalles. Copia el valor de **"Dirección IPv4 pública"** (ej. `54.72.XXX.XXX`).
4. **Guarda esta IP** — la usarás en el paso de IONOS (Fase 4) y en los Secrets de GitHub.

> ⚠️ **Atención:** En AWS Educate, la IP pública puede cambiar cada vez que paras y reinicias la instancia. Para evitar esto, asigna una **Elastic IP** (IP estática gratuita): Ve a EC2 → IPs Elásticas → Asignar IP Elástica → Asociar con tu instancia.

---

### PASO 3.4 — Conectarte al servidor por SSH

**En Windows (con PowerShell o Windows Terminal):**

1. Abre PowerShell y navega a donde guardaste el archivo `.pem`:
   ```powershell
   cd C:\Users\chakr\Downloads
   ```
2. Da permisos al archivo (solo la primera vez):
   ```powershell
   icacls pachangapp-key.pem /inheritance:r /grant:r "$($env:USERNAME):(R)"
   ```
3. Conéctate:
   ```powershell
   ssh -i pachangapp-key.pem ubuntu@TU_IP_PUBLICA
   ```
   - Reemplaza `TU_IP_PUBLICA` por la IP del paso anterior.
   - Si te pregunta "Are you sure you want to continue connecting?", escribe `yes` y pulsa Enter.
   - Si todo va bien, verás el prompt de Ubuntu: `ubuntu@ip-xxx:~$`

---

### PASO 3.5 — Instalar Docker y Docker Compose en el servidor

Una vez conectado por SSH, ejecuta estos comandos **uno a uno** en el servidor:

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Permitir usar Docker sin sudo
sudo usermod -aG docker ubuntu
newgrp docker

# Verificar que Docker está instalado
docker --version

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Verificar Docker Compose
docker compose version
```

---

### PASO 3.6 — Instalar Kubernetes (K3s)

K3s es una versión ligera de Kubernetes, perfecta para servidores pequeños de AWS Educate.

```bash
# Instalar K3s
curl -sfL https://get.k3s.io | sh -

# Esperar ~1 minuto y verificar que el nodo está listo
sudo kubectl get nodes
```

Deberías ver algo como:
```
NAME              STATUS   ROLES                  AGE   VERSION
ip-172-xx-xx-xx   Ready    control-plane,master   1m    v1.28.x
```

Si el STATUS es `Ready`, ¡Kubernetes está funcionando! 🎉

```bash
# Configurar kubectl para usarlo sin sudo
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown ubuntu:ubuntu ~/.kube/config
export KUBECONFIG=~/.kube/config

# Verificar sin sudo
kubectl get nodes
```

- **(Checkbox marcado: Contenedores y Kubernetes — clúster en la nube)**

---

## FASE 4: Dominio DNS en IONOS 🌐

Le decimos al mundo que `pachangapp.es` apunta a tu máquina de AWS.

1. Entra al panel de **IONOS** → Dominios → `pachangapp.es` → Gestionar DNS.
2. Crea o edita los registros:
   | Tipo | Host | Apunta a |
   |------|------|----------|
   | A | `@` | `TU_IP_PUBLICA_AWS` |
   | A | `www` | `TU_IP_PUBLICA_AWS` |
   | A | `api` | `TU_IP_PUBLICA_AWS` |
3. Guarda y espera entre 10 minutos y 1 hora a que se propague.

> Con el registro `api`, podrás acceder al backend en `http://api.pachangapp.es:8091`. Kubernetes redirigirá el tráfico correctamente.

- **(Checkbox marcado: Nube y Nombres de Dominio)**

---

## FASE 5: Manifiestos Kubernetes + Ingress + HTTPS

Crea una carpeta `k8s/` en la raíz del proyecto. Estos archivos le dicen a Kubernetes qué levantar y cómo enrutar el tráfico.

### 5.1 Despliegues y Servicios — `k8s/`

Antes de nada, crea la carpeta `k8s/` en la **raíz de tu proyecto** (`PachangApp/k8s/`). Dentro de ella crearemos varios archivos `.yaml`.

---

#### PASO 5.1.1 — Secrets (contraseñas y datos sensibles) — `k8s/secrets.yaml`

Kubernetes tiene un objeto especial llamado `Secret` para guardar contraseñas sin escribirlas en texto plano en el código. Los valores deben ir en **Base64**.

Para codificar tus valores, ejecuta esto en tu terminal (local o en el servidor):
```bash
# En Linux/Mac:
echo -n "pachangapp_pass" | base64
# Output: cGFjaGFuZ2FwcF9wYXNz

echo -n "pachangapp_user" | base64
# Output: cGFjaGFuZ2FwcF91c2Vy

echo -n "pachangapp" | base64  # nombre de la base de datos
# Output: cGFjaGFuZ2FwcA==

echo -n "root" | base64
# Output: cm9vdA==
```

Crea el archivo `k8s/secrets.yaml`:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: pachangapp-secrets
type: Opaque
data:
  # Todos los valores en Base64 (los de arriba si no los cambias)
  db-name: cGFjaGFuZ2FwcA==
  db-user: cGFjaGFuZ2FwcF91c2Vy
  db-password: cGFjaGFuZ2FwcF9wYXNz
  db-root-password: cm9vdA==
```

---

#### PASO 5.1.2 — Base de Datos MySQL — `k8s/mysql.yaml`

Crea el archivo `k8s/mysql.yaml` con el siguiente contenido **exacto**:

```yaml
# ---------- PersistentVolumeClaim (almacenamiento permanente para los datos) ----------
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi

---
# ---------- Deployment (el contenedor MySQL) ----------
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mysql
  template:
    metadata:
      labels:
        app: mysql
    spec:
      containers:
        - name: mysql
          image: mysql:8.0
          ports:
            - containerPort: 3306
          env:
            - name: MYSQL_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: pachangapp-secrets
                  key: db-root-password
            - name: MYSQL_DATABASE
              valueFrom:
                secretKeyRef:
                  name: pachangapp-secrets
                  key: db-name
            - name: MYSQL_USER
              valueFrom:
                secretKeyRef:
                  name: pachangapp-secrets
                  key: db-user
            - name: MYSQL_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: pachangapp-secrets
                  key: db-password
          volumeMounts:
            - name: mysql-storage
              mountPath: /var/lib/mysql
      volumes:
        - name: mysql-storage
          persistentVolumeClaim:
            claimName: mysql-pvc

---
# ---------- Service (permite que el Backend encuentre MySQL por nombre) ----------
apiVersion: v1
kind: Service
metadata:
  name: mysql-service
spec:
  selector:
    app: mysql
  ports:
    - port: 3306
      targetPort: 3306
  clusterIP: None  # Headless service — solo accesible desde dentro del clúster, no desde internet
```

> El `clusterIP: None` es importante: significa que la BBDD NO es accesible desde internet, solo desde el Backend dentro de Kubernetes. Esto es seguro por diseño.

---

#### PASO 5.1.3 — Backend Spring Boot — `k8s/backend.yaml`

Crea el archivo `k8s/backend.yaml`. **Importante:** cambia `TU_USUARIO_DOCKERHUB` por tu usuario real de DockerHub.

```yaml
# ---------- Deployment (el contenedor del Backend) ----------
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: TU_USUARIO_DOCKERHUB/pachangapp-backend:latest
          ports:
            - containerPort: 8091
          env:
            # URL de conexión a la BBDD — usa el nombre del Service de MySQL
            - name: SPRING_DATASOURCE_URL
              value: "jdbc:mysql://mysql-service:3306/pachangapp?allowPublicKeyRetrieval=true&useSSL=false"
            - name: SPRING_DATASOURCE_USERNAME
              valueFrom:
                secretKeyRef:
                  name: pachangapp-secrets
                  key: db-user
            - name: SPRING_DATASOURCE_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: pachangapp-secrets
                  key: db-password

---
# ---------- Service (expone el Backend al Ingress y al exterior en puerto 8091) ----------
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - port: 8091
      targetPort: 8091
  type: ClusterIP
```

---

#### PASO 5.1.4 — Frontend Nginx — `k8s/frontend.yaml`

Crea el archivo `k8s/frontend.yaml`:

```yaml
# ---------- Deployment (el contenedor del Frontend) ----------
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: TU_USUARIO_DOCKERHUB/pachangapp-frontend:latest
          ports:
            - containerPort: 80

---
# ---------- Service (expone el Frontend al Ingress) ----------
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 80
  type: ClusterIP
```

---

#### PASO 5.1.5 — n8n — `k8s/n8n.yaml`

Crea el archivo `k8s/n8n.yaml`:

```yaml
# ---------- PersistentVolumeClaim (guardar los flujos de n8n) ----------
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: n8n-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi

---
# ---------- Deployment ----------
apiVersion: apps/v1
kind: Deployment
metadata:
  name: n8n
spec:
  replicas: 1
  selector:
    matchLabels:
      app: n8n
  template:
    metadata:
      labels:
        app: n8n
    spec:
      containers:
        - name: n8n
          image: docker.n8n.io/n8nio/n8n
          ports:
            - containerPort: 5678
          env:
            - name: N8N_HOST
              value: "n8n.pachangapp.es"
            - name: N8N_PORT
              value: "5678"
            - name: N8N_PROTOCOL
              value: "https"
            - name: WEBHOOK_URL
              value: "https://n8n.pachangapp.es/"
          volumeMounts:
            - name: n8n-storage
              mountPath: /home/node/.n8n
      volumes:
        - name: n8n-storage
          persistentVolumeClaim:
            claimName: n8n-pvc

---
# ---------- Service ----------
apiVersion: v1
kind: Service
metadata:
  name: n8n-service
spec:
  selector:
    app: n8n
  ports:
    - port: 5678
      targetPort: 5678
  type: ClusterIP
```

> Para acceder a n8n desde fuera tendrás que añadir también un registro DNS en IONOS: `n8n` → `TU_IP_PUBLICA_AWS`, igual que hiciste con `api` en la Fase 4. Y añadir su ruta en el `ingress.yaml` de la Fase 5.3.

---

#### PASO 5.1.6 — Aplicar todos los archivos al clúster

> ⚠️ **Tu repo es de una organización GitHub con 2FA activado.** Git NO acepta tu contraseña normal para clonar. Debes usar un **Personal Access Token (PAT)**. Sigue estos pasos antes de clonar:
>
> 1. En GitHub, ve a: **Settings (tuyo, no de la org)** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**.
> 2. Haz clic en **"Generate new token (classic)"**.
> 3. Dale un nombre como `servidor-aws` y marca los permisos: `repo` (acceso completo a repos).
> 4. Haz clic en **"Generate token"** y **copia el token ahora** — solo se muestra una vez. Tiene este aspecto: `ghp_XXXXXXXXXXXXXXXXXXXX`.
> 5. Guárdalo, lo usarás como contraseña al clonar.

Una vez que tengas el token, conectado por SSH al servidor EC2:

```bash
# Instalar git si no está
sudo apt install git -y

# Clonar el repositorio de la organización usando el token como contraseña
# Formato: https://TU_USUARIO:TU_TOKEN@github.com/ORGANIZACION/REPO.git
git clone https://TU_USUARIO_GITHUB:ghp_TUTOKEN@github.com/NOMBRE_ORGANIZACION/PachangApp.git
cd PachangApp
```

> Reemplaza:
> - `TU_USUARIO_GITHUB` → tu usuario personal de GitHub (no el de la org)
> - `ghp_TUTOKEN` → el token que acabas de generar
> - `NOMBRE_ORGANIZACION` → el nombre de la organización en GitHub

Ahora aplica los manifiestos en orden:

```bash
# Aplicar en orden: primero los secrets, luego la BBDD, luego el resto
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/mysql.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/n8n.yaml

# Verificar que todos los pods están arrancando
kubectl get pods

# Esperar hasta que salgan todos como "Running" (puede tardar 1-2 minutos)
kubectl get pods -w
```

Deberías ver algo como:
```
NAME                        READY   STATUS    RESTARTS
mysql-xxx                   1/1     Running   0
backend-xxx                 1/1     Running   0
frontend-xxx                1/1     Running   0
n8n-xxx                     1/1     Running   0
```

- **(Checkbox marcado: Contenedores y Kubernetes — manifiestos YAML)**


### 5.2 Ingress Controller (Enrutador de tráfico)
K3s incluye **Traefik** como Ingress Controller por defecto. No hace falta instalarlo. Se encarga de que:
- `pachangapp.es` → va al contenedor del **Frontend**
- `api.pachangapp.es` → va al contenedor del **Backend** (puerto 8091)

- **(Checkbox marcado: Configuración de Servidores Web / Ingress Controllers)**

### 5.3 Certificados HTTPS con cert-manager — `k8s/ingress.yaml`

#### PASO 5.3.1 — Añadir registro DNS de n8n en IONOS

Antes de crear el Ingress, recuerda añadir este registro en el panel DN de IONOS igual que hiciste con `api`:

| Tipo | Host | Apunta a |
|------|------|----------|
| A | `n8n` | `TU_IP_ELASTICA_AWS` |

---

#### PASO 5.3.2 — Instalar cert-manager en el clúster

En el servidor EC2 **por SSH**, ejecuta:

```bash
# Instalar cert-manager (gestor de certificados SSL automáticos)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/latest/download/cert-manager.yaml

# Esperar ~1 minuto a que sus pods arranquen
kubectl get pods -n cert-manager
# Debes ver 3 pods en estado "Running" antes de continuar
```

---

#### PASO 5.3.3 — Crear el ClusterIssuer (quien emite los certificados)

Crea el archivo `k8s/clusterissuer.yaml`:

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    # Servidor de Let's Encrypt para producción
    server: https://acme-v02.api.letsencrypt.org/directory
    # Pon aquí tu email real para recibir avisos de expiración
    email: TU_EMAIL@gmail.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: traefik
```

Aplícalo:
```bash
kubectl apply -f k8s/clusterissuer.yaml
```

---

#### PASO 5.3.4 — Crear el archivo `k8s/ingress.yaml`

Este archivo unifica todo el enrutamiento de tu app. Crea `k8s/ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pachangapp-ingress
  annotations:
    # Le dice a cert-manager que genere certificados SSL automáticamente
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    # Fuerza que todo el tráfico sea HTTPS
    traefik.ingress.kubernetes.io/router.entrypoints: websecure
spec:
  tls:
  - hosts:
    - pachangapp.es
    - www.pachangapp.es
    - api.pachangapp.es
    - n8n.pachangapp.es
    secretName: pachangapp-tls
  rules:
  # 1. Frontend (Web principal)
  - host: pachangapp.es
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80

  # 2. Backend (API REST)
  - host: api.pachangapp.es
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8091

  # 3. n8n (Automatizaciones y flujos)
  - host: n8n.pachangapp.es
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: n8n-service
            port:
              number: 5678
```

Aplícalo:
```bash
kubectl apply -f k8s/clusterissuer.yaml
kubectl apply -f k8s/ingress.yaml

# Verificar que el Ingress está activo
kubectl get ingress

# Verificar que los certificados SSL se están generando (puede tardar 2-5 min)
kubectl get certificate
# Cuando ponga READY = True, tu HTTPS está funcionando
```

- **(Checkbox marcado: Configuración de Servidores Web / Ingress Controllers)**
- **(Checkbox marcado: Protocolos Seguros HTTPS / Let's Encrypt)**

---

## FASE 6: CI/CD Automatizado con GitHub Actions 🤖

Al hacer `push` a la rama `main`, GitHub automáticamente: testea el código, construye las imágenes Docker y actualiza el servidor de AWS.

- **Dónde:** Crea el archivo `.github/workflows/deploy.yml` en la raíz del repositorio.

```yaml
name: CI/CD PachangApp

on:
  push:
    branches: [ "main" ]

jobs:

  test-backend:
    name: Tests del Backend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Configurar Java 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Ejecutar tests con Maven
        run: mvn test -f backend/pom.xml

  build-and-push-images:
    name: Construir y subir imágenes Docker
    needs: test-backend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Login en DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - name: Build & Push Backend
        run: |
          cd backend && mvn package -DskipTests
          docker build -t ${{ secrets.DOCKERHUB_USERNAME }}/pachangapp-backend:latest .
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/pachangapp-backend:latest
      - name: Build & Push Frontend
        run: |
          cd frontend
          docker build -t ${{ secrets.DOCKERHUB_USERNAME }}/pachangapp-frontend:latest .
          docker push ${{ secrets.DOCKERHUB_USERNAME }}/pachangapp-frontend:latest

  deploy-to-aws:
    name: Desplegar en AWS (Kubernetes)
    needs: build-and-push-images
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Desplegar en el servidor de AWS via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.AWS_EC2_IP }}
          username: ubuntu
          key: ${{ secrets.AWS_SSH_KEY }}
          script: |
            sudo kubectl apply -f /home/ubuntu/pachangapp/k8s/
            sudo kubectl rollout restart deployment/backend
            sudo kubectl rollout restart deployment/frontend
```

> ⚠️ **Secrets necesarios en GitHub** (Settings → Secrets → Actions):
> - `DOCKERHUB_USERNAME` → Tu usuario de DockerHub
> - `DOCKERHUB_TOKEN` → Token de acceso de DockerHub (no tu contraseña)
> - `AWS_EC2_IP` → La IP Pública de tu instancia EC2
> - `AWS_SSH_KEY` → El contenido de tu archivo `.pem` de AWS (clave privada SSH)

- **(Checkbox marcado: CI/CD con GitHub Actions y SCV)**

---

## 🔥 Orden de ejecución recomendado

| Paso | Tarea | Estado |
|------|-------|--------|
| 0 | Instalar Swagger en `pom.xml` | ✅ Hecho |
| 1 | Crear `backend/Dockerfile` | ✅ Hecho |
| 2 | Crear `frontend/Dockerfile` | ✅ Hecho |
| 3 | Crear `docker-compose.yml` en la raíz | ✅ Hecho |
| 4 | Crear instancia EC2 en AWS Educate | ✅ Hecho |
| 5 | Vincular `pachangapp.es` a la IP de AWS en IONOS | ✅ Hecho |
| 6 | Instalar K3s + Docker en la EC2 | ✅ Hecho |
| 7 | Crear carpeta `k8s/` con todos los manifiestos | ✅ Hecho |
| 8 | Aplicar manifiestos con `kubectl apply` | ✅ Hecho |
| 9 | Instalar cert-manager, clusterissuer e ingress | ✅ Hecho |
| 10 | Configurar Secrets en GitHub y crear `deploy.yml` | ⬜ Pendiente |
| 11 | Hacer push a `main` y verificar que el CI/CD despliega solo | ⬜ Pendiente |
| 12 | Verificación final completa | ⬜ Pendiente |

---

## ANTES DE COMMITEAR el `deploy.yml` — Configurar Secrets en GitHub

> ⚠️ Si haces push del `deploy.yml` **antes** de configurar los Secrets, el Action fallará inmediatamente porque no encontrará las variables. Configúralos primero.

### PASO A — Crear cuenta y token en DockerHub

1. Si no tienes cuenta, créala en [https://hub.docker.com](https://hub.docker.com) con el usuario `devIbrahim14`.
2. Una vez dentro: **Account Settings** → **Security** → **New Access Token**.
3. Dale un nombre como `github-actions` y copia el token generado.

---

### PASO B — Añadir los 4 Secrets en GitHub

Ve a tu repositorio en GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Añade estos 4 uno por uno:

| Nombre del Secret | Valor que debes poner |
|---|---|
| `DOCKERHUB_USERNAME` | `devIbrahim14` |
| `DOCKERHUB_TOKEN` | El token que generaste en DockerHub |
| `AWS_EC2_IP` | Tu IP Elástica de AWS (ej. `54.72.XXX.XXX`) |
| `AWS_SSH_KEY` | El contenido **completo** del archivo `pachangapp-key.pem` |

> Para copiar el contenido del `.pem` en PowerShell:
> ```powershell
> Get-Content C:\Users\chakr\Downloads\pachangapp-key.pem | Set-Clipboard
> ```
> Luego pégalo directamente en el campo de valor del Secret.

---

### PASO C — Commitear y hacer push del deploy.yml

Una vez configurados los 4 Secrets, ya puedes subir el workflow:

```powershell
git add .github/workflows/deploy.yml
git commit -m "Añadir CI/CD con GitHub Actions"
git push
```

> Recuerda: el Action solo se dispara cuando haces push a `main`. Para probarlo por primera vez, deberás hacer un **Pull Request** de `feature-despliegue` → `main` y mergearlo.

---

## ✅ FASE FINAL — Verificación completa del despliegue

Una vez que el CI/CD haya corrido correctamente (puedes verlo en la pestaña **Actions** de GitHub), verifica que todo funciona:

### En el servidor AWS (SSH):

```bash
# Ver que todos los pods están Running (ya no ImagePullBackOff)
kubectl get pods

# Ver el estado del Ingress (debe mostrar tu IP)
kubectl get ingress

# Ver que los certificados SSL están listos (READY = True)
kubectl get certificate

# Si algún pod falla, ver sus logs:
kubectl logs deployment/backend
kubectl logs deployment/frontend
```

### Desde el navegador:

| URL | Qué debe aparecer |
|-----|-------------------|
| `https://pachangapp.es` | Tu frontend React cargado con HTTPS |
| `https://api.pachangapp.es/swagger-ui.html` | Documentación de tu API (Swagger) |
| `https://n8n.pachangapp.es` | Panel de login de n8n |

### Si algo falla:

```bash
# Ver eventos recientes del clúster (errores y advertencias)
kubectl get events --sort-by='.lastTimestamp'

# Describir un pod específico para ver el error exacto
kubectl describe pod NOMBRE_DEL_POD

# Reiniciar un deployment si lo necesitas
kubectl rollout restart deployment/backend
```

### Comprobar el CI/CD en GitHub:

1. Entra a tu repositorio en GitHub.
2. Haz clic en la pestaña **"Actions"**.
3. Verás el pipeline ejecutándose (o ejecutado). Cada paso debe tener un ✅ verde.
4. Si hay un error, haz clic en el paso rojo para ver el log exacto del fallo.

---

> 🎉 **¡Si todas las URLs cargan con el candado HTTPS y los pods están en Running, el Apartado 8 está 100% completado!**

---

## 🔧 PENDIENTE — Problemas detectados a resolver

### PROBLEMA 1 — Certificado SSL en `False` (HTTPS no activo)

El certificado `pachangapp-tls` lleva más de 60 minutos en estado `READY: False`. Esto significa que Let's Encrypt **no ha podido validar el dominio**.

**¿Por qué pasa?** Let's Encrypt necesita acceder a `http://pachangapp.es/.well-known/acme-challenge/...` para verificar que el dominio es tuyo. Si el puerto 80 no está abierto o el frontend no respondía cuando intentó validar, falla.

**Diagnóstico — ejecuta esto en el servidor (SSH):**

```bash
# Ver el estado detallado del certificado
sudo kubectl describe certificate pachangapp-tls

# Ver si hay un "challenge" pendiente
sudo kubectl get challenge

# Ver los detalles del challenge (si existe)
sudo kubectl describe challenge
```

Busca en la salida si aparece algo como `pending` o `failed` en el campo `reason`.

**Solución más habitual:**

1. Verifica que en tu **Security Group de AWS** tienes el puerto **80 (HTTP)** abierto para `0.0.0.0/0`. Sin él, Let's Encrypt no puede validar.
2. Si los pods ya están en `Running`, borra el certificado para forzar que se regenere:
```bash
sudo kubectl delete certificate pachangapp-tls
# cert-manager lo recreará automáticamente en 1-2 minutos
sudo kubectl get certificate -w
# Espera hasta que READY = True
```

---

### PROBLEMA 2 — El frontend no conecta con el backend en producción

**Por qué falla:** El frontend tiene el archivo `src/apiConfig.js` hardcodeado con `localhost:8091`. En producción, el navegador del usuario intenta conectar a `http://localhost:8091/api` en su propio ordenador, que claramente no existe.

**El archivo a modificar es `frontend/src/apiConfig.js`:**

```javascript
// Detectamos si estamos en la App de Capacitor (móvil) o en el navegador del PC
const isCapacitor = window.location.protocol === 'capacitor:' || !!window.Capacitor?.isNativePlatform();

// Detectamos si estamos en producción (dominio real) o en desarrollo (localhost)
const isProduction = window.location.hostname === 'pachangapp.es' || window.location.hostname === 'www.pachangapp.es';

// Tu IP de red local (para el móvil en desarrollo)
const PC_IP = "192.168.18.156";
const PORT = "8091";

export const API_BASE_URL = isCapacitor
  ? `http://${PC_IP}:${PORT}/api`          // Móvil en desarrollo → IP local
  : isProduction
    ? `https://api.pachangapp.es/api`       // Navegador en producción → dominio real
    : `http://localhost:${PORT}/api`;       // Navegador en desarrollo → localhost
```

**Pasos para aplicarlo:**
1. Modifica el archivo `frontend/src/apiConfig.js` con el código de arriba.
2. Haz commit y push a `feature-despliegue`:
```powershell
git add frontend/src/apiConfig.js
git commit -m "fix: API URL apunta a produccion en el navegador"
git push
```
3. El CI/CD reconstruirá la imagen del frontend con la URL correcta y lo desplegará automáticamente.
4. En unos minutos podrás iniciar sesión desde `https://pachangapp.es`.

> ⚠️ También hay un fetch hardcodeado en `frontend/src/components/home/CamposDestacados.jsx` en la línea 13. Cámbialo de:
> `fetch("http://localhost:8091/api/campos")`
> a:
> `fetch(\`${API_BASE_URL}/campos\`)` (importando `API_BASE_URL` desde `apiConfig.js`)
