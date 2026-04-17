#!/bin/bash
# =============================================================================
# SCRIPT 01: Configuración del Servidor AWS EC2 desde Cero
# =============================================================================
# Ejecutar en el servidor de AWS con: bash 01-setup-server.sh
# Tiempo estimado: ~10 minutos
# =============================================================================

set -e  # Parar si cualquier comando falla

echo "=================================================="
echo "  PachangApp - Configuración del Servidor AWS"
echo "=================================================="

# --- PASO 1: Actualizar el sistema ---
echo "[1/7] Actualizando el sistema..."
sudo apt-get update -y && sudo apt-get upgrade -y

# --- PASO 2: Instalar k3s (Kubernetes ligero) ---
echo "[2/7] Instalando k3s (Kubernetes)..."
curl -sfL https://get.k3s.io | sh -

# Esperar a que k3s esté listo
sleep 10
sudo kubectl wait --for=condition=Ready nodes --all --timeout=120s

echo "  ✅ k3s instalado. Versión:"
sudo kubectl version --short

# --- PASO 3: Instalar Helm ---
echo "[3/7] Instalando Helm..."
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
echo "  ✅ Helm instalado."

# --- PASO 4: Instalar cert-manager (para certificados SSL automáticos) ---
echo "[4/7] Instalando cert-manager..."
sudo kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.4/cert-manager.yaml

echo "  Esperando a que cert-manager esté listo (30s)..."
sleep 30
sudo kubectl wait --for=condition=Ready pods --all -n cert-manager --timeout=120s
echo "  ✅ cert-manager instalado."

# --- PASO 5: Clonar el repositorio ---
echo "[5/7] Clonando el repositorio..."
# IMPORTANTE: Cambia esta URL por la de tu repositorio si cambia
REPO_URL="https://github.com/PachangApp/pachangapp-core.git"
BRANCH="feature-despliegue"

if [ -d "/home/ubuntu/pachangapp-core" ]; then
    echo "  El repositorio ya existe. Actualizando..."
    cd /home/ubuntu/pachangapp-core
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH
else
    cd /home/ubuntu
    git clone $REPO_URL
    cd pachangapp-core
    git checkout $BRANCH
fi
echo "  ✅ Repositorio listo en /home/ubuntu/pachangapp-core (rama: $BRANCH)"

# --- PASO 6: Aplicar Secrets de Kubernetes ---
echo "[6/7] Aplicando Secrets..."
echo ""
echo "  ⚠️  IMPORTANTE: Debes editar el archivo k8s/secrets.yaml con tus valores"
echo "  reales antes de continuar. Ejecuta:"
echo "  nano /home/ubuntu/pachangapp-core/k8s/secrets.yaml"
echo ""
read -p "  ¿Has editado los secrets? (s/n): " confirm
if [ "$confirm" = "s" ]; then
    sudo kubectl apply -f /home/ubuntu/pachangapp-core/k8s/secrets.yaml
    echo "  ✅ Secrets aplicados."
else
    echo "  ⚠️  Saltando secrets. Aplícalos manualmente con:"
    echo "  sudo kubectl apply -f /home/ubuntu/pachangapp-core/k8s/secrets.yaml"
fi

# --- PASO 7: Desplegar toda la aplicación ---
echo "[7/7] Desplegando PachangApp en Kubernetes..."
cd /home/ubuntu/pachangapp-core
sudo kubectl apply -f k8s/

echo ""
echo "  Esperando a que los pods arranquen (60s)..."
sleep 60
sudo kubectl get pods

echo ""
echo "=================================================="
echo "  ✅ Instalación completada."
echo "  Siguiente paso: Ejecutar 02-setup-github-secrets.sh en tu PC local"
echo "  para actualizar los secretos de GitHub con la nueva IP."
echo "=================================================="
