# =============================================================================
# SCRIPT 02: Actualizar Secretos de GitHub con la Nueva IP del Lab
# =============================================================================
# Ejecutar en tu PC (Windows PowerShell) con:
# .\02-setup-github-secrets.ps1
#
# Requisitos: GitHub CLI instalado (winget install GitHub.cli)
# =============================================================================

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  PachangApp - Actualizar Secretos de GitHub" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# --- CONFIGURACIÓN (CAMBIA ESTOS VALORES) ---
$REPO         = "PachangApp/pachangapp-core"       # Tu repositorio de GitHub
$NEW_IP       = Read-Host "Introduce la nueva IP Elástica de AWS"
$SSH_KEY_PATH = Read-Host "Ruta a tu archivo .pem del Lab (ej: C:\Users\tu\lab.pem)"

# --- VERIFICAR QUE gh CLI ESTÁ INSTALADO ---
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "  ❌ GitHub CLI (gh) no está instalado." -ForegroundColor Red
    Write-Host "  Instálalo con: winget install GitHub.cli" -ForegroundColor Yellow
    exit 1
}

# --- LOGIN EN GITHUB (si no estás ya logueado) ---
Write-Host "`n[1/3] Verificando login de GitHub CLI..."
gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Iniciando login en GitHub..."
    gh auth login
}
Write-Host "  ✅ Autenticado en GitHub."

# --- ACTUALIZAR LA IP EN LOS SECRETOS ---
Write-Host "`n[2/3] Actualizando el secreto AWS_EC2_IP con la nueva IP: $NEW_IP"
gh secret set AWS_EC2_IP --body "$NEW_IP" --repo $REPO
Write-Host "  ✅ AWS_EC2_IP actualizado."

# --- ACTUALIZAR LA CLAVE SSH ---
Write-Host "`n[3/3] Actualizando el secreto AWS_SSH_KEY con tu archivo .pem..."
if (Test-Path $SSH_KEY_PATH) {
    $SSH_KEY_CONTENT = Get-Content $SSH_KEY_PATH -Raw
    gh secret set AWS_SSH_KEY --body "$SSH_KEY_CONTENT" --repo $REPO
    Write-Host "  ✅ AWS_SSH_KEY actualizado."
} else {
    Write-Host "  ❌ No se encontró el archivo .pem en: $SSH_KEY_PATH" -ForegroundColor Red
    Write-Host "  Actualiza el secreto manualmente en GitHub -> Settings -> Secrets." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  ✅ Secretos de GitHub actualizados." -ForegroundColor Green
Write-Host "  Siguiente paso: Actualiza el DNS en IONOS con la nueva IP: $NEW_IP" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
