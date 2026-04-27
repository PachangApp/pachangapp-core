# ☁️ PachangApp en la Nube — Guía Completa de Infraestructura

> **Objetivo de esta guía:** Cuando te den un laboratorio nuevo de AWS Academy,
> seguir esta guía de principio a fin debe dejarte **todo funcionando en menos de 30 minutos**,
> sin hacer nada a mano que no esté ya automatizado.

---

## 🗺️ Arquitectura Completa

```
[GitHub Actions] ──push──► build imágenes ──► DockerHub
                                                    │
[Tu PC / PC Compañero]                              │ pull
        │ HTTPS                                     │
        ▼                                           ▼
[AWS EC2 Ubuntu — Kubernetes (k3s)]
  ├── Traefik          ← Balanceo + SSL automático (ya incluido en k3s)
  ├── cert-manager     ← Let's Encrypt automático
  ├── Frontend         ← pachangapp.es
  ├── Backend          ← api.pachangapp.es
  ├── MySQL            ← BBDD compartida
  └── n8n              ← n8n.pachangapp.es (PachanBot)
        │ SDK
        ▼
[AWS S3] ← Imágenes permanentes (bucket: pachangapp-images)

[IONOS DNS] ── apunta ──► IP Elástica de AWS
```

---

## 📁 Scripts Disponibles (carpeta `scripts/`)

| Script | Dónde se ejecuta | Qué hace |
|--------|-----------------|----------|
| `01-setup-server.sh` | Servidor AWS (SSH) | Instala k3s, cert-manager, clona el repo y despliega todo |
| `02-setup-github-secrets.ps1` | Tu PC Windows (PowerShell) | Actualiza `AWS_EC2_IP` y `AWS_SSH_KEY` en GitHub |
| `03-setup-s3.sh` | Servidor AWS (SSH) | Crea el bucket S3 y el usuario IAM (solo la primera vez) |

---

## ⚡ PROTOCOLO: Nuevo Lab AWS en 6 Pasos

### PASO 1 — Obtener la nueva IP Elástica (2 min)

1. Entra en [AWS Academy](https://awsacademy.instructure.com) → inicia el lab.
2. Ve a la consola de AWS → buscador → **EC2**.
3. En el menú izquierdo: **Network & Security → Elastic IPs**.
4. Si ves una IP ya asignada a tu instancia → **úsala directamente**.
5. Si no hay ninguna:
   - Haz clic en **"Allocate Elastic IP address"** → confirma.
   - Selecciona la IP creada → **Actions → Associate Elastic IP** → elige tu instancia EC2.
6. **Anota la IP** (ej: `54.92.14.203`). La necesitas en los Pasos 2 y 5.

> **⚠️ Importante:** Si el lab expiró del todo y te dieron una instancia EC2 nueva,
> también te habrán dado un archivo `.pem` nuevo. Guárdalo porque lo necesitas en el Paso 2.

---

### PASO 2 — Actualizar GitHub Secrets desde tu PC (2 min)

Este script actualiza automáticamente los secretos `AWS_EC2_IP` y `AWS_SSH_KEY` en GitHub
para que el CI/CD sepa hacia dónde desplegarse.

#### Requisito previo (solo la primera vez):
```powershell
# Instala GitHub CLI si no lo tienes
winget install GitHub.cli

# Autentícate (abre el navegador)
gh auth login
```

#### Ejecutar el script:
```powershell
cd C:\Users\chakr\Desktop\PachangApp
.\scripts\02-setup-github-secrets.ps1
```

El script te pedirá:
1. **La nueva IP Elástica** (la del Paso 1, ej: `54.92.14.203`).
2. **La ruta al archivo .pem** del nuevo lab (ej: `C:\Users\chakr\Downloads\labsuser.pem`).

Y actualizará los secretos en GitHub automáticamente. Eso es todo.

---

### PASO 3 — Configurar el servidor desde cero (10 min)

Conéctate al servidor por SSH y ejecuta el script de instalación:

```bash
# 1. Conéctate (sustituye con tu IP y .pem del nuevo lab)
ssh -i "C:\Users\chakr\Downloads\labsuser.pem" ubuntu@TU_NUEVA_IP

# 2. Descarga el script de instalación directamente desde GitHub
curl -o setup.sh https://raw.githubusercontent.com/PachangApp/pachangapp-core/feature-despliegue/scripts/01-setup-server.sh

# 3. Dale permisos y ejecútalo
chmod +x setup.sh && bash setup.sh
```

#### ¿Qué hace el script paso a paso?
| Paso interno | Qué instala/hace | Tiempo est. |
|---|---|---|
| [1/7] | Actualiza el sistema Ubuntu | 2 min |
| [2/7] | Instala **k3s** (Kubernetes ligero, ya trae Traefik) | 2 min |
| [3/7] | Instala **Helm** (gestor de paquetes de Kubernetes) | 30s |
| [4/7] | Instala **cert-manager** (certificados SSL Let's Encrypt) | 2 min |
| [5/7] | Clona el repositorio de GitHub en `/home/ubuntu/pachangapp-core` | 30s |
| [6/7] | Te pregunta si los secrets están listos (di **N** aquí) | — |
| [7/7] | Despliega toda la app con `kubectl apply -f k8s/` | 2 min |

> **⚠️ Cuando el script pregunte `¿Has editado los secrets? (s/n):`
> responde N** y continúa al Paso 4.

---

### PASO 4 — Aplicar los Secrets de Kubernetes (3 min)

Los secrets **no están en GitHub** (están en `.gitignore` para proteger las contraseñas),
así que hay que crearlos manualmente en cada lab nuevo.

#### 4.1 — Genera los valores en Base64

Ejecuta cada uno de estos comandos para obtener el valor codificado:

```bash
# En el servidor, genera los valores que necesitas:
echo -n "pachangapp" | base64         # → cGFjaGFuZ2FwcA==  (db-name)
echo -n "pachangapp_user" | base64    # → cGFjaGFuZ2FwcF91c2Vy (db-user)
echo -n "pachangapp_pass" | base64    # → cGFjaGFuZ2FwcF9wYXNz (db-password)
echo -n "root" | base64               # → cm9vdA== (db-root-password)
echo -n "pachangapp-images" | base64  # → cGFjaGFuZ2FwcC1pbWFnZXM= (s3-bucket-name)
echo -n "us-east-1" | base64          # → dXMtZWFzdC0x (s3-region)
# Para s3-access-key y s3-secret-key: usa los valores del Paso S3 (ver sección S3 abajo)
echo -n "TU_ACCESS_KEY_REAL" | base64
echo -n "TU_SECRET_KEY_REAL" | base64
```

#### 4.2 — Edita el archivo de secrets

```bash
cd /home/ubuntu/pachangapp-core
nano k8s/secrets.yaml
```

Pega exactamente esto (sustituyendo los `<...>` por los valores del paso anterior):

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: pachangapp-secrets
type: Opaque
data:
  # Base de datos
  db-name:          cGFjaGFuZ2FwcA==
  db-user:          cGFjaGFuZ2FwcF91c2Vy
  db-password:      cGFjaGFuZ2FwcF9wYXNz
  db-root-password: cm9vdA==
  # S3 (obtén estos valores del script 03-setup-s3.sh o del lab anterior)
  s3-access-key:    <TU_ACCESS_KEY_EN_BASE64>
  s3-secret-key:    <TU_SECRET_KEY_EN_BASE64>
  s3-bucket-name:   cGFjaGFuZ2FwcC1pbWFnZXM=
  s3-region:        dXMtZWFzdC0x
```

Guarda con `Ctrl+O`, sal con `Ctrl+X`.

#### 4.3 — Aplica los secrets y reinicia

```bash
sudo kubectl apply -f k8s/secrets.yaml
sudo kubectl rollout restart deployment/backend
sudo kubectl rollout restart deployment/mysql
```

---

### PASO 5 — Actualizar el DNS en IONOS (1 min)

1. Entra en [https://my.ionos.es](https://my.ionos.es).
2. **Dominios & SSL → pachangapp.es → Gestionar dominio → DNS**.
3. Actualiza los 4 registros de tipo **A** con tu nueva IP:

| Tipo | Nombre del Host | Nuevo valor |
|------|----------------|-------------|
| A | `@` (dominio raíz) | TU_NUEVA_IP |
| A | `www` | TU_NUEVA_IP |
| A | `api` | TU_NUEVA_IP |
| A | `n8n` | TU_NUEVA_IP |

4. Guarda los cambios. Tardan **2-10 minutos** en propagarse.

Una vez propagados, cert-manager detectará el cambio y pedirá el certificado SSL
automáticamente. Puedes monitorizarlo con:

```bash
sudo kubectl get certificate
# Espera a ver READY: True
```

---

### PASO 6 — Verificación Final (3 min)

```bash
# 1. Todos los pods deben decir "Running" (puede tardar 2-3 min la primera vez)
sudo kubectl get pods

# 2. Certificado SSL — esperar READY: True
sudo kubectl get certificate

# 3. La BD tiene tablas (Spring Boot las crea sola)
sudo kubectl exec -it $(sudo kubectl get pod -l app=mysql -o jsonpath='{.items[0].metadata.name}') \
  -- mysql -u root -proot -e "USE pachangapp; SHOW TABLES;"

# 4. El backend responde con datos reales
curl https://api.pachangapp.es/api/partidos

# 5. La web carga con candado verde
# Abre en el navegador: https://pachangapp.es
```

Si todo está en verde, **avisa a tu compañero** para que entre.

---

## 🪣 Configuración de S3 (Solo la primera vez en tu vida)

El bucket S3 **sobrevive entre labs** porque es un servicio independiente de EC2.
Si ya tienes el bucket `pachangapp-images` creado y guardaste las claves, salta esta sección.

Si es la primera vez o perdiste las claves:

```bash
# En el servidor de AWS (ya conectado por SSH)
bash /home/ubuntu/pachangapp-core/scripts/03-setup-s3.sh
```

El script hará automáticamente:
- Crear el bucket `pachangapp-images` en `us-east-1`.
- Desactivar el bloqueo de acceso público.
- Aplicar la política de lectura pública.
- Crear el usuario IAM `pachangapp-s3-user` con permisos restringidos.
- **Generar las Access Keys y mostrarte los valores en Base64** listos para pegar en `secrets.yaml`.

Al final del script verás algo así:
```
  Valores en Base64 para k8s/secrets.yaml:
  s3-access-key: QUtJQUlPU0ZPRE5ON0VYQU1QTEU=
  s3-secret-key: d0phbHJYVXRuRkVNSS9LN01ERU5HL2JQeVJmaUNZRVhBTVBMRUtFWQ==
  s3-bucket-name: cGFjaGFuZ2FwcC1pbWFnZXM=
  s3-region: dXMtZWFzdC0x
```

Copia esos valores y pégalos directamente en el Paso 4.2.

---

## 👥 Configuración para tu Compañero

Para que tu compañero vea los mismos datos sin montar nada en su PC:

1. Él clona el repositorio: `git clone https://github.com/PachangApp/pachangapp-core.git`
2. Arranca solo el **frontend** local: `npm run dev` (en la carpeta `frontend/`).
3. El frontend apunta a `https://api.pachangapp.es` (backend en la nube).
4. Comparte la misma BBDD MySQL que está en tu servidor de AWS.

Si quiere también el backend local, necesita tener el `application.properties` con:
```properties
spring.datasource.url=jdbc:mysql://mysql-service:3306/pachangapp?allowPublicKeyRetrieval=true&useSSL=false
```

---

## 📋 Checklist Rápido — Nuevo Lab

Imprime o pega esto en un documento y márcalo:

```
[ ] 1. Lab iniciado y IP Elástica obtenida
[ ] 2. Scripts 02-setup-github-secrets.ps1 ejecutado en el PC
[ ] 3. Conectado por SSH al servidor nuevo
[ ] 4. Script 01-setup-server.sh descargado y ejecutado
[ ] 5. k8s/secrets.yaml editado con valores reales y aplicado
[ ] 6. DNS en IONOS actualizado con la nueva IP (4 registros A)
[ ] 7. kubectl get pods → todos en Running
[ ] 8. kubectl get certificate → READY: True
[ ] 9. https://pachangapp.es abre con candado verde
[ ] 10. Compañero avisado y verificado que puede entrar
```

---

## ⚠️ Notas Críticas

> **NUNCA subas a GitHub:** `k8s/secrets.yaml` ni los `.pem` de AWS.
> Ya están en `.gitignore`. Si los subes por error, rota las claves inmediatamente
> desde la consola de AWS IAM.

> **MySQL se pierde al apagar el lab.** Antes de apagar, haz un backup:
> ```bash
> sudo kubectl exec -it $(sudo kubectl get pod -l app=mysql -o jsonpath='{.items[0].metadata.name}') \
>   -- mysqldump -u root -proot pachangapp > ~/backup-$(date +%Y%m%d).sql
> ```
> Guarda ese `.sql` en tu PC. Para restaurarlo en un lab nuevo:
> ```bash
> # Copia el backup al servidor y luego:
> sudo kubectl exec -i $(sudo kubectl get pod -l app=mysql -o jsonpath='{.items[0].metadata.name}') \
>   -- mysql -u root -proot pachangapp < backup.sql
> ```

> **S3 sí persiste entre labs.** Las imágenes quedan en S3 para siempre mientras no las borres.
> Lo único que puede caducar son las Access Keys de IAM en AWS Academy.
> Si el script 03 falla, borra el usuario `pachangapp-s3-user` en IAM y vuelve a ejecutar.

> **IP Elástica con coste.** Si el lab está apagado pero la IP Elástica no tiene ninguna
> instancia asignada, AWS te cobra. Desasígnala cuando apagues el lab.

---

## 🗄️ Configuración Premium: Amazon RDS + S3 (Infraestructura de Producción)

> **¿Cuándo usar esto?**
> La guía anterior usa MySQL dentro de Kubernetes (gratis pero efímero: se pierde al apagar el lab).
> Esta sección explica cómo migrar a **Amazon RDS**, que es una base de datos gestionada por AWS
> que sobrevive entre labs, tiene backups automáticos y es más robusta.
>
> **El precio:** RDS consume créditos más rápido. Una instancia `db.t3.micro` gasta entre
> 2€-5€/día de créditos del lab. Úsalo cuando tengáis créditos de sobra o cuando
> vayáis a hacer una demo importante.

### Comparativa: MySQL en K8s vs RDS

| Característica | MySQL en Kubernetes | Amazon RDS |
|---|---|---|
| 💰 Coste en lab | Gratis (incluido en EC2) | ~2-5€/día de créditos |
| 💾 Datos al apagar lab | **Se pierden** | **Persisten** |
| 🔧 Mantenimiento | Manual (tú gestionas) | Automático (AWS lo gestiona) |
| 📦 Backups | Manuales (script dump) | Automáticos diarios |
| 🚀 Rendimiento | Básico | Optimizado |
| **Conclusión** | Para desarrollo y pruebas | Para demos y producción |

---

### Script 04: Crear Amazon RDS

```bash
# En el servidor de AWS (ya conectado por SSH)
bash /home/ubuntu/pachangapp-core/scripts/04-setup-rds.sh
```

#### ¿Qué hace internamente el script?

| Paso | Qué hace | Tiempo |
|---|---|---|
| [1/5] | Verifica que AWS CLI está instalado | 10s |
| [2/5] | Crea un Security Group que permite tráfico MySQL (puerto 3306) | 30s |
| [3/5] | Crea la instancia RDS MySQL 8.0 db.t3.micro con 20 GB | ⏳ 10-15 min |
| [4/5] | Obtiene el endpoint (URL) de conexión de RDS | 10s |
| [5/5] | Genera y muestra los valores en Base64 para `secrets.yaml` | 10s |

Al terminar verás algo así:
```
  ENDPOINT RDS: pachangapp-db.abc123.us-east-1.rds.amazonaws.com

  Valores en Base64 para k8s/secrets.yaml:
  db-name:     cGFjaGFuZ2FwcA==
  db-user:     cGFjaGFuZ2FwcF91c2Vy
  db-password: cGFjaGFuZ2FwcF9wYXNzXzIwMjQ=
```

---

### Conectar el Backend a RDS (en vez de MySQL interno)

Una vez tienes el endpoint de RDS, debes hacer **DOS cambios**:

#### Cambio 1 — `k8s/backend.yaml`

Localiza la variable `SPRING_DATASOURCE_URL` y cámbiala por el endpoint de RDS:

```yaml
# ANTES (MySQL interno de Kubernetes):
- name: SPRING_DATASOURCE_URL
  value: "jdbc:mysql://mysql-service:3306/pachangapp?allowPublicKeyRetrieval=true&useSSL=false"

# DESPUÉS (Amazon RDS — sustituye ENDPOINT_RDS por el valor real):
- name: SPRING_DATASOURCE_URL
  value: "jdbc:mysql://ENDPOINT_RDS:3306/pachangapp?allowPublicKeyRetrieval=true&useSSL=false"
```

#### Cambio 2 — `k8s/secrets.yaml`

Usa los valores Base64 que te ha dado el script del RDS (db-user y db-password).

Después de editar ambos archivos, aplícalos:

```bash
sudo kubectl apply -f k8s/secrets.yaml
sudo kubectl apply -f k8s/backend.yaml
sudo kubectl rollout restart deployment/backend
```

#### Cambio 3 — Deshabilitar MySQL interno (opcional, ahorra RAM)

Si ya usas RDS, no necesitas el pod de MySQL en Kubernetes. Para apagarlo:

```bash
sudo kubectl delete deployment mysql
sudo kubectl delete service mysql-service
sudo kubectl delete pvc mysql-pvc
```

> No borres el `mysql.yaml` del repo porque si quieres volver al modo "barato" lo necesitas.

---

### Verificar que el Backend se conecta al RDS

```bash
# 1. Ver los logs del backend (busca "HikariPool connected" o similar)
sudo kubectl logs $(sudo kubectl get pod -l app=backend -o jsonpath='{.items[0].metadata.name}') --tail=30

# 2. Probar que responde con datos
curl https://api.pachangapp.es/api/partidos
```

---

### Nuevo Protocolo con RDS: Checklist Premium

```
[ ] 1. Lab iniciado y IP Elástica obtenida
[ ] 2. Script 02-setup-github-secrets.ps1 ejecutado en el PC
[ ] 3. Conectado por SSH al servidor
[ ] 4. Script 01-setup-server.sh ejecutado (instala todo)
[ ] 5. Script 03-setup-s3.sh ejecutado (solo si es la primera vez)
[ ] 6. Script 04-setup-rds.sh ejecutado (crea la BD gestionada)
[ ] 7. k8s/backend.yaml actualizado con el endpoint RDS
[ ] 8. k8s/secrets.yaml editado con todos los valores y aplicado
[ ] 9. MySQL interno de Kubernetes eliminado (para ahorrar RAM)
[ ] 10. DNS en IONOS actualizado con la nueva IP
[ ] 11. kubectl get pods → todos en Running (sin pod mysql)
[ ] 12. kubectl get certificate → READY: True
[ ] 13. curl https://api.pachangapp.es/api/partidos → devuelve JSON
[ ] 14. https://pachangapp.es abre con candado verde
[ ] 15. Compañero avisado y verificado que puede entrar
```

---

### Tabla de Scripts Actualizada (Completa)

| Script | Dónde ejecutar | Qué hace | ¿Cuándo? |
|--------|---------------|----------|----------|
| `01-setup-server.sh` | Servidor AWS | Instala k3s, cert-manager y despliega la app | Siempre, primer paso en el servidor |
| `02-setup-github-secrets.ps1` | Tu PC (PowerShell) | Actualiza IP y .pem en GitHub | Siempre, cuando cambia el lab |
| `03-setup-s3.sh` | Servidor AWS | Crea bucket S3 e IAM | Solo la primera vez |
| `04-setup-rds.sh` | Servidor AWS | Crea instancia RDS MySQL | Cuando quieres BD persistente |

