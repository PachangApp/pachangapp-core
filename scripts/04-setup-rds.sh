#!/bin/bash
# =============================================================================
# SCRIPT 04: Crear Base de Datos RDS (MySQL Gestionado en AWS)
# =============================================================================
# Ejecutar en el servidor de AWS con AWS CLI configurado
# IMPORTANTE: RDS consume créditos más rápido que MySQL en Kubernetes.
# Solo usa esto cuando quieras la configuración premium/producción.
# Tiempo estimado: ~10 minutos (RDS tarda en aprovisionarse)
# =============================================================================

set -e

echo "=================================================="
echo "  PachangApp - Configuración de Amazon RDS"
echo "=================================================="

# ===================== CONFIGURA ESTOS VALORES =====================
DB_INSTANCE_ID="pachangapp-db"
DB_NAME="pachangapp"
DB_USER="pachangapp_user"
DB_PASSWORD="pachangapp_pass_2024"   # Cambia esto por una contraseña segura
DB_CLASS="db.t3.micro"               # La más barata del free tier
DB_ENGINE="mysql"
DB_ENGINE_VERSION="8.0"
DB_STORAGE=20                        # GB mínimo
REGION="us-east-1"
# ==================================================================

# --- PASO 1: Verificar AWS CLI ---
if ! command -v aws &> /dev/null; then
    echo "[!] Instalando AWS CLI..."
    sudo apt-get install -y awscli
fi
echo "[1/5] ✅ AWS CLI disponible."

# --- PASO 2: Crear Security Group para RDS ---
echo "[2/5] Creando Security Group para permitir tráfico al RDS..."

# Obtener el VPC por defecto
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" \
    --query 'Vpcs[0].VpcId' --output text --region $REGION)

echo "  VPC encontrada: $VPC_ID"

# Crear Security Group
SG_ID=$(aws ec2 create-security-group \
    --group-name "pachangapp-rds-sg" \
    --description "Permite acceso MySQL desde el servidor EC2" \
    --vpc-id $VPC_ID \
    --region $REGION \
    --query 'GroupId' --output text 2>/dev/null) || \
SG_ID=$(aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=pachangapp-rds-sg" \
    --query 'SecurityGroups[0].GroupId' --output text --region $REGION)

echo "  Security Group: $SG_ID"

# Permitir tráfico MySQL desde cualquier IP dentro de la VPC
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 3306 \
    --cidr 0.0.0.0/0 \
    --region $REGION 2>/dev/null || echo "  (Regla ya existía)"

echo "  ✅ Security Group configurado."

# --- PASO 3: Crear la instancia RDS ---
echo "[3/5] Creando instancia RDS (tarda ~10 minutos, ten paciencia)..."

aws rds create-db-instance \
    --db-instance-identifier $DB_INSTANCE_ID \
    --db-instance-class $DB_CLASS \
    --engine $DB_ENGINE \
    --engine-version $DB_ENGINE_VERSION \
    --master-username $DB_USER \
    --master-user-password $DB_PASSWORD \
    --db-name $DB_NAME \
    --allocated-storage $DB_STORAGE \
    --vpc-security-group-ids $SG_ID \
    --publicly-accessible \
    --no-multi-az \
    --no-enable-performance-insights \
    --region $REGION 2>/dev/null || echo "  (La instancia ya existe, continuando...)"

echo "  ✅ Solicitud de creación enviada. Esperando que RDS esté disponible..."
echo "  Esto puede tardar entre 5 y 15 minutos..."

# Esperar a que RDS esté disponible
aws rds wait db-instance-available \
    --db-instance-identifier $DB_INSTANCE_ID \
    --region $REGION

echo "  ✅ RDS disponible!"

# --- PASO 4: Obtener el endpoint de RDS ---
echo "[4/5] Obteniendo endpoint de RDS..."

RDS_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier $DB_INSTANCE_ID \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text \
    --region $REGION)

echo "  ✅ RDS Endpoint: $RDS_ENDPOINT"

# --- PASO 5: Generar los valores para secrets.yaml ---
echo "[5/5] Generando valores en Base64 para k8s/secrets.yaml..."

B64_URL=$(echo -n "jdbc:mysql://${RDS_ENDPOINT}:3306/${DB_NAME}?allowPublicKeyRetrieval=true&useSSL=false" | base64 -w 0)
B64_USER=$(echo -n "$DB_USER" | base64)
B64_PASS=$(echo -n "$DB_PASSWORD" | base64)
B64_NAME=$(echo -n "$DB_NAME" | base64)

echo ""
echo "=================================================="
echo "  ✅ RDS creado correctamente."
echo ""
echo "  ENDPOINT RDS: $RDS_ENDPOINT"
echo "  (Actualiza IONOS y el backend con este endpoint)"
echo ""
echo "  Valores en Base64 para k8s/secrets.yaml:"
echo "  db-name:     $B64_NAME"
echo "  db-user:     $B64_USER"
echo "  db-password: $B64_PASS"
echo ""
echo "  Añade también este secret nuevo si quieres guardar la URL completa:"
echo "  db-url:      $B64_URL"
echo ""
echo "  SIGUIENTE PASO: Actualiza k8s/backend.yaml para que use el RDS en"
echo "  lugar de 'mysql-service'. Cambia la variable SPRING_DATASOURCE_URL a:"
echo "  jdbc:mysql://${RDS_ENDPOINT}:3306/${DB_NAME}?allowPublicKeyRetrieval=true&useSSL=false"
echo "=================================================="
