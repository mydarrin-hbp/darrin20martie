[CmdletBinding()]
param(
    [string]$ProjectId = "mydarrin-platform",
    [string]$Region = "europe-west9",
    [string]$ArtifactRepo = "mydarrin-cloud-run",
    [string]$BackendService = "mydarrin-backend",
    [string]$BackofficeService = "mydarrin-backoffice",
    [string]$BackendImageTag = "",
    [string]$BackofficeImageTag = "",
    [string]$DatabaseUrlSecret = "DATABASE_URL",
    [string]$JwtSecret = "JWT_SECRET",
    [string]$GoogleApiKeySecret = "GOOGLE_API_KEY",
    [string]$GateUsername = "ownergate",
    [string]$GatePassword = "CHANGE_ME",
    [string]$CorsOrigins = "http://127.0.0.1:3000,http://localhost:3000,http://172.30.176.1:3000,https://mydarrin.homebestpal.com,https://mydarrin.com",
    [string]$GcsBucket = "run-sources-mydarrin-platform-europe-west9",
    [string]$GcsPrefix = "attachments",
    [switch]$SkipBuild,
    [switch]$SkipBackend,
    [switch]$SkipBackoffice
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Require-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Lipseste comanda necesara: $Name"
    }
}

function Ensure-GCloudProject {
    $currentProject = (& gcloud config get-value project 2>$null).Trim()
    if ($currentProject -ne $ProjectId) {
        Write-Step "Setez proiectul gcloud la $ProjectId"
        & gcloud config set project $ProjectId | Out-Host
    }
}

function Ensure-ServiceEnabled {
    param([string]$ServiceName)
    $enabled = & gcloud services list --enabled --project $ProjectId --filter "config.name=$ServiceName" --format "value(config.name)"
    if (-not $enabled) {
        Write-Step "Activez serviciul $ServiceName"
        & gcloud services enable $ServiceName --project $ProjectId | Out-Host
    }
}

function Ensure-ArtifactRepo {
    $exists = $true
    try {
        & gcloud artifacts repositories describe $ArtifactRepo --location $Region --project $ProjectId | Out-Null
    } catch {
        $exists = $false
    }

    if (-not $exists) {
        Write-Step "Creez Artifact Registry repo $ArtifactRepo"
        & gcloud artifacts repositories create $ArtifactRepo `
            --repository-format docker `
            --location $Region `
            --description "Cloud Run images for My Darrin" `
            --project $ProjectId | Out-Host
    }
}

function New-BackofficeEnvFile {
    param(
        [string]$ApiBaseUrl,
        [string]$AuthorizationHeader
    )

    $tempPath = Join-Path $env:TEMP "mydarrin-backoffice-cloudrun-env.yaml"
    $yaml = @(
        "NEXT_PUBLIC_API_BASE_URL: `"$ApiBaseUrl`""
        "NEXT_PUBLIC_GATE_USERNAME: `"$GateUsername`""
        "NEXT_PUBLIC_GATE_PASSWORD: `"$GatePassword`""
        "NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION: `"$AuthorizationHeader`""
    ) -join "`n"
    Set-Content -Path $tempPath -Value $yaml -Encoding UTF8
    return $tempPath
}

function New-BackendEnvFile {
    $tempPath = Join-Path $env:TEMP "mydarrin-backend-cloudrun-env.yaml"
    $yaml = @(
        'JWT_ALGORITHM: "HS256"'
        'JWT_EXPIRATION_HOURS: "24"'
        "BACKEND_CORS_ORIGINS: `"$CorsOrigins`""
        'ENABLE_BASIC_AUTH_GATE: "true"'
        "BASIC_AUTH_GATE_USERNAME: `"$GateUsername`""
        "BASIC_AUTH_GATE_PASSWORD: `"$GatePassword`""
        'ATTACHMENTS_STORAGE_BACKEND: "gcs"'
        "GCS_ATTACHMENTS_BUCKET: `"$GcsBucket`""
        "GCS_ATTACHMENTS_PREFIX: `"$GcsPrefix`""
    ) -join "`n"
    Set-Content -Path $tempPath -Value $yaml -Encoding UTF8
    return $tempPath
}

Require-Command "gcloud"

Write-Step "Verific configurarea gcloud"
& gcloud auth list --filter=status:ACTIVE --format "value(account)" | Out-Host
Ensure-GCloudProject
Ensure-ServiceEnabled "run.googleapis.com"
Ensure-ServiceEnabled "cloudbuild.googleapis.com"
Ensure-ServiceEnabled "artifactregistry.googleapis.com"
Ensure-ArtifactRepo

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$resolvedBackendTag = if ([string]::IsNullOrWhiteSpace($BackendImageTag)) { if ($SkipBuild) { "latest" } else { $timestamp } } else { $BackendImageTag }
$resolvedBackofficeTag = if ([string]::IsNullOrWhiteSpace($BackofficeImageTag)) { if ($SkipBuild) { "latest" } else { $timestamp } } else { $BackofficeImageTag }
$backendImage = "$Region-docker.pkg.dev/$ProjectId/$ArtifactRepo/${BackendService}:$resolvedBackendTag"
$backofficeImage = "$Region-docker.pkg.dev/$ProjectId/$ArtifactRepo/${BackofficeService}:$resolvedBackofficeTag"
$basicAuthBytes = [System.Text.Encoding]::UTF8.GetBytes("${GateUsername}:${GatePassword}")
$backendGateAuthorization = "Basic " + [Convert]::ToBase64String($basicAuthBytes)

if (-not $SkipBackend) {
    if (-not $SkipBuild) {
        Write-Step "Build backend image"
        & gcloud builds submit backend --tag $backendImage --project $ProjectId | Out-Host
    }

    Write-Step "Deploy backend Cloud Run service"
    $backendEnvFile = New-BackendEnvFile
    try {
        & gcloud run deploy $BackendService `
            --image $backendImage `
            --project $ProjectId `
            --region $Region `
            --allow-unauthenticated `
            --env-vars-file $backendEnvFile `
            --set-secrets "DATABASE_URL=${DatabaseUrlSecret}:latest,JWT_SECRET=${JwtSecret}:latest,GOOGLE_API_KEY=${GoogleApiKeySecret}:latest" | Out-Host
    } finally {
        if (Test-Path $backendEnvFile) {
            Remove-Item $backendEnvFile -Force
        }
    }
}

$backendUrl = (& gcloud run services describe $BackendService --project $ProjectId --region $Region --format "value(status.url)").Trim()
if (-not $backendUrl) {
    throw "Nu am putut citi URL-ul backend-ului dupa deploy."
}

if (-not $SkipBackoffice) {
    if (-not $SkipBuild) {
        Write-Step "Build backoffice image"
        & gcloud builds submit backoffice `
            --config backoffice/cloudbuild.yaml `
            --project $ProjectId `
            --substitutions "_IMAGE=$backofficeImage,_NEXT_PUBLIC_API_BASE_URL=$backendUrl,_NEXT_PUBLIC_GATE_USERNAME=$GateUsername,_NEXT_PUBLIC_GATE_PASSWORD=$GatePassword,_NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION=$backendGateAuthorization" | Out-Host
    }

    Write-Step "Deploy backoffice Cloud Run service"
    $backofficeEnvFile = New-BackofficeEnvFile -ApiBaseUrl $backendUrl -AuthorizationHeader $backendGateAuthorization
    try {
        & gcloud run deploy $BackofficeService `
            --image $backofficeImage `
            --project $ProjectId `
            --region $Region `
            --allow-unauthenticated `
            --env-vars-file $backofficeEnvFile | Out-Host
    } finally {
        if (Test-Path $backofficeEnvFile) {
            Remove-Item $backofficeEnvFile -Force
        }
    }
}

$backofficeUrl = (& gcloud run services describe $BackofficeService --project $ProjectId --region $Region --format "value(status.url)").Trim()

Write-Host ""
Write-Host "Deploy finalizat." -ForegroundColor Green
Write-Host "Backend:    $backendUrl"
Write-Host "Backoffice: $backofficeUrl"
Write-Host ""
Write-Host "Comanda de rerulare:"
Write-Host ".\\scripts\\deploy_cloud_run.ps1"
