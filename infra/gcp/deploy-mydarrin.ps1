param(
  [string]$ProjectId = "mydarrin-platform",
  [string]$Region = "europe-west3",
  [string]$ArtifactRepo = "mydarrin",
  [string]$EnvFile = ".\\infra\\gcp\\.env.mydarrin.production"
)

$ErrorActionPreference = "Stop"

function Import-SimpleEnv {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    throw "Env file not found: $Path"
  }

  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) { return }
    $parts = $line -split "=", 2
    if ($parts.Count -eq 2) {
      [System.Environment]::SetEnvironmentVariable($parts[0], $parts[1])
    }
  }
}

function Escape-GcloudSubstitutionValue {
  param([string]$Value)

  if ($null -eq $Value) {
    return ""
  }

  return $Value.Replace("\", "\\").Replace(",", "\,")
}

function Ensure-EnvValue {
  param(
    [string]$Name,
    [string]$Value
  )

  if ([string]::IsNullOrWhiteSpace($Value) -or $Value -match "CHANGE_ME|SET_IN_SECRET_MANAGER_OR_ENV") {
    throw "Required env value '$Name' is missing or still uses a placeholder."
  }
}

function Ensure-DomainMapping {
  param(
    [string]$Service,
    [string]$Domain,
    [string]$Region
  )

  try {
    $existing = gcloud beta run domain-mappings list --region=$Region --format="value(metadata.name,spec.routeName)" |
      Select-String -Pattern "^$Domain\s+$Service$"

    if (-not $existing) {
      gcloud beta run domain-mappings create --service=$Service --domain=$Domain --region=$Region
    }
  }
  catch {
    Write-Warning "Skipping domain mapping for '$Domain' in region '$Region'. Configure custom domains via Load Balancer / serverless NEG or a supported region."
  }
}

function New-TempEnvFile {
  param(
    [string]$Prefix,
    [hashtable]$Values
  )

  $tempPath = Join-Path $env:TEMP "$Prefix-$ProjectId-$Region.yaml"
  $lines = @()
  foreach ($key in $Values.Keys) {
    $escaped = [string]$Values[$key]
    $escaped = $escaped.Replace('"', '\"')
    $lines += "${key}: `"$escaped`""
  }
  Set-Content -Path $tempPath -Value $lines -Encoding UTF8
  return $tempPath
}

Import-SimpleEnv -Path $EnvFile

Ensure-EnvValue -Name "BACKEND_GATE_AUTHORIZATION" -Value $env:BACKEND_GATE_AUTHORIZATION
Ensure-EnvValue -Name "NEXT_PUBLIC_GATE_USERNAME" -Value $env:NEXT_PUBLIC_GATE_USERNAME
Ensure-EnvValue -Name "NEXT_PUBLIC_GATE_PASSWORD" -Value $env:NEXT_PUBLIC_GATE_PASSWORD
Ensure-EnvValue -Name "JWT_SECRET" -Value $env:JWT_SECRET
Ensure-EnvValue -Name "BASIC_AUTH_GATE_USERNAME" -Value $env:BASIC_AUTH_GATE_USERNAME
Ensure-EnvValue -Name "BASIC_AUTH_GATE_PASSWORD" -Value $env:BASIC_AUTH_GATE_PASSWORD

gcloud config set project $ProjectId

gcloud services enable `
  run.googleapis.com `
  cloudbuild.googleapis.com `
  artifactregistry.googleapis.com `
  dns.googleapis.com `
  sqladmin.googleapis.com `
  certificatemanager.googleapis.com `
  compute.googleapis.com `
  secretmanager.googleapis.com

$artifactRepoExists = gcloud artifacts repositories list --location=$Region --filter="name~/$ArtifactRepo$" --format="value(name)"
if (-not $artifactRepoExists) {
  gcloud artifacts repositories create $ArtifactRepo `
    --repository-format=docker `
    --location=$Region `
    --description="My Darrin container images"
}

$publicBucketExists = gcloud storage buckets list --filter="name:mydarrin-public-assets" --format="value(name)"
if (-not $publicBucketExists) {
  gcloud storage buckets create gs://mydarrin-public-assets --location=$Region
}

$secureBucketExists = gcloud storage buckets list --filter="name:mydarrin-secure-attachments" --format="value(name)"
if (-not $secureBucketExists) {
  gcloud storage buckets create gs://mydarrin-secure-attachments --location=$Region
}

$backendCorsOrigins = @(
  "https://$($env:PUBLIC_STAGE_DOMAIN)",
  "https://$($env:ADMIN_DOMAIN)"
) -join ","

$backendEnvFile = New-TempEnvFile -Prefix "mydarrin-backend-env" -Values @{
  DATABASE_URL = $env:DATABASE_URL_CLOUD_RUN
  JWT_SECRET = $env:JWT_SECRET
  BACKEND_CORS_ORIGINS = $backendCorsOrigins
  ENABLE_BASIC_AUTH_GATE = $env:ENABLE_BASIC_AUTH_GATE
  BASIC_AUTH_GATE_USERNAME = $env:BASIC_AUTH_GATE_USERNAME
  BASIC_AUTH_GATE_PASSWORD = $env:BASIC_AUTH_GATE_PASSWORD
  ATTACHMENTS_STORAGE_BACKEND = $env:ATTACHMENTS_STORAGE_BACKEND
  GCS_ATTACHMENTS_BUCKET = $env:GCS_ATTACHMENTS_BUCKET
  GCS_ATTACHMENTS_PREFIX = $env:GCS_ATTACHMENTS_PREFIX
  GOOGLE_API_KEY = $env:GOOGLE_API_KEY
  GEMINI_API_KEY = $env:GEMINI_API_KEY
}

$frontendEnvFile = New-TempEnvFile -Prefix "mydarrin-frontend-env" -Values @{
  NEXT_PUBLIC_API_BASE_URL = "https://$($env:API_DOMAIN)"
  API_BASE_URL_PUBLIC = "https://$($env:API_DOMAIN)"
  NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION = $env:BACKEND_GATE_AUTHORIZATION
  BACKEND_GATE_AUTHORIZATION = $env:BACKEND_GATE_AUTHORIZATION
}

$backofficeEnvFile = New-TempEnvFile -Prefix "mydarrin-backoffice-env" -Values @{
  NEXT_PUBLIC_API_BASE_URL = "https://$($env:API_DOMAIN)"
  NEXT_PUBLIC_GATE_USERNAME = $env:NEXT_PUBLIC_GATE_USERNAME
  NEXT_PUBLIC_GATE_PASSWORD = $env:NEXT_PUBLIC_GATE_PASSWORD
  NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION = $env:BACKEND_GATE_AUTHORIZATION
}

$substitutionPairs = @(
  "_REGION=$Region"
  "_AR_REPO=$ArtifactRepo"
  "_API_BASE_URL=https://$($env:API_DOMAIN)"
  "_BACKEND_GATE_AUTHORIZATION=$($env:BACKEND_GATE_AUTHORIZATION)"
  "_GATE_USERNAME=$($env:NEXT_PUBLIC_GATE_USERNAME)"
  "_GATE_PASSWORD=$($env:NEXT_PUBLIC_GATE_PASSWORD)"
  "_DATABASE_URL_CLOUD_RUN=$($env:DATABASE_URL_CLOUD_RUN)"
  "_CLOUD_SQL_INSTANCE=$($env:CLOUD_SQL_INSTANCE_CONNECTION_NAME)"
  "_JWT_SECRET=$($env:JWT_SECRET)"
  "_BACKEND_CORS_ORIGINS=$backendCorsOrigins"
  "_ENABLE_BASIC_AUTH_GATE=$($env:ENABLE_BASIC_AUTH_GATE)"
  "_BASIC_AUTH_GATE_USERNAME=$($env:BASIC_AUTH_GATE_USERNAME)"
  "_BASIC_AUTH_GATE_PASSWORD=$($env:BASIC_AUTH_GATE_PASSWORD)"
  "_ATTACHMENTS_STORAGE_BACKEND=$($env:ATTACHMENTS_STORAGE_BACKEND)"
  "_GCS_ATTACHMENTS_BUCKET=$($env:GCS_ATTACHMENTS_BUCKET)"
  "_GCS_ATTACHMENTS_PREFIX=$($env:GCS_ATTACHMENTS_PREFIX)"
)

$substitutions = "^;^" + ($substitutionPairs -join ";")

gcloud builds submit . `
  --config=cloudbuild.yaml `
  "--substitutions=$substitutions"

if ($LASTEXITCODE -ne 0) {
  throw "Cloud Build submit failed. Stoping deploy so Cloud Run services are not updated from stale images."
}

$backendServiceExists = gcloud run services list --region=$Region --filter="metadata.name=$($env:BACKEND_SERVICE)" --format="value(metadata.name)"
$frontendServiceExists = gcloud run services list --region=$Region --filter="metadata.name=$($env:FRONTEND_SERVICE)" --format="value(metadata.name)"
$backofficeServiceExists = gcloud run services list --region=$Region --filter="metadata.name=$($env:BACKOFFICE_SERVICE)" --format="value(metadata.name)"

if (-not $backendServiceExists -or -not $frontendServiceExists -or -not $backofficeServiceExists) {
  throw "One or more Cloud Run services were not created by Cloud Build. Run 'gcloud run services list --region $Region' and inspect the Cloud Build logs before continuing."
}

gcloud run services update $env:BACKEND_SERVICE `
  --region=$Region `
  --env-vars-file=$backendEnvFile

gcloud run services update $env:FRONTEND_SERVICE `
  --region=$Region `
  --env-vars-file=$frontendEnvFile

gcloud run services update $env:BACKOFFICE_SERVICE `
  --region=$Region `
  --env-vars-file=$backofficeEnvFile

Ensure-DomainMapping -Service $env:FRONTEND_SERVICE -Domain $env:PUBLIC_STAGE_DOMAIN -Region $Region
Ensure-DomainMapping -Service $env:BACKOFFICE_SERVICE -Domain $env:ADMIN_DOMAIN -Region $Region
Ensure-DomainMapping -Service $env:BACKEND_SERVICE -Domain $env:API_DOMAIN -Region $Region
