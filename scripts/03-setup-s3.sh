#!/bin/bash
# =============================================================================
# SCRIPT 03: Crear Bucket S3 y Usuario IAM para PachangApp
# =============================================================================
# Ejecutar en el servidor de AWS o en local si tienes AWS CLI configurado
# Tiempo estimado: ~3 minutos
# =============================================================================

set -e

echo "=================================================="
echo "  PachangApp - Configuración de S3 e IAM"
echo "=================================================="

BUCKET_NAME="pachangapp-images"
REGION="us-east-1"
IAM_USER="pachangapp-s3-user"
POLICY_NAME="PachangAppS3Policy"

# --- PASO 1: Verificar AWS CLI ---
if ! command -v aws &> /dev/null; then
    echo "[!] Instalando AWS CLI..."
    sudo apt-get install -y awscli
fi
echo "[1/5] ✅ AWS CLI disponible."

# --- PASO 2: Crear el Bucket S3 ---
echo "[2/5] Creando bucket S3: $BUCKET_NAME..."
if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    aws s3api create-bucket \
        --bucket $BUCKET_NAME \
        --region $REGION 2>/dev/null || true
    echo "  ✅ Bucket creado."
else
    echo "  ℹ️  El bucket ya existe, saltando creación."
fi

# Desactivar bloqueo de acceso público
aws s3api put-public-access-block \
    --bucket $BUCKET_NAME \
    --public-access-block-configuration \
        "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# --- PASO 3: Aplicar política pública de lectura ---
echo "[3/5] Aplicando política de lectura pública al bucket..."
POLICY='{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::'"$BUCKET_NAME"'/*"
    }
  ]
}'
echo $POLICY | aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///dev/stdin
echo "  ✅ Política pública aplicada."

# --- PASO 4: Crear Usuario IAM para el Backend ---
echo "[4/5] Creando usuario IAM: $IAM_USER..."
aws iam create-user --user-name $IAM_USER 2>/dev/null || echo "  ℹ️  El usuario ya existe."

# Crear y adjuntar política
POLICY_DOC='{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject","s3:GetObject","s3:DeleteObject","s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::'"$BUCKET_NAME"'",
        "arn:aws:s3:::'"$BUCKET_NAME"'/*"
      ]
    }
  ]
}'
POLICY_ARN=$(aws iam create-policy \
    --policy-name $POLICY_NAME \
    --policy-document "$POLICY_DOC" \
    --query 'Policy.Arn' --output text 2>/dev/null || \
    aws iam list-policies --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text)

aws iam attach-user-policy --user-name $IAM_USER --policy-arn $POLICY_ARN
echo "  ✅ Usuario IAM creado y política adjuntada."

# --- PASO 5: Crear Access Key y mostrarla ---
echo "[5/5] Generando Access Key para el usuario..."
KEYS=$(aws iam create-access-key --user-name $IAM_USER)
ACCESS_KEY=$(echo $KEYS | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['AccessKey']['AccessKeyId'])")
SECRET_KEY=$(echo $KEYS | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['AccessKey']['SecretAccessKey'])")

echo ""
echo "=================================================="
echo "  ✅ S3 e IAM configurados. Guarda estas claves:"
echo "  ACCESS KEY ID: $ACCESS_KEY"
echo "  SECRET ACCESS KEY: $SECRET_KEY"
echo ""
echo "  Ahora ejecuta en tu servidor Kubernetes:"
echo "  kubectl create secret generic s3-credentials \\"
echo "    --from-literal=access-key=$ACCESS_KEY \\"
echo "    --from-literal=secret-key=$SECRET_KEY"
echo "=================================================="

# Generar los valores en Base64 para secrets.yaml
echo ""
echo "  Valores en Base64 para añadir a k8s/secrets.yaml:"
echo "  s3-access-key: $(echo -n $ACCESS_KEY | base64)"
echo "  s3-secret-key: $(echo -n $SECRET_KEY | base64)"
echo "  s3-bucket-name: $(echo -n $BUCKET_NAME | base64)"
echo "  s3-region: $(echo -n $REGION | base64)"
