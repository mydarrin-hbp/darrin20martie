# Cloud Run One-Command Deploy

Acest rollout pregateste `backend` si `backoffice` pe Google Cloud Run cu o singura comanda.

## Ce foloseste

- `backend/Dockerfile`
- `backoffice/Dockerfile`
- `backoffice/cloudbuild.yaml`
- `backend/cloudrun-env.yaml`
- `scripts/deploy_cloud_run.ps1`

## Cerinte

- `gcloud` instalat si autentificat
- proiect GCP activ: `mydarrin-platform`
- secrete existente in Secret Manager:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `GOOGLE_API_KEY`

## Comanda

```powershell
.\scripts\deploy_cloud_run.ps1
```

## Ce face scriptul

1. verifica `gcloud`
2. seteaza proiectul GCP
3. activeaza serviciile:
   - `run.googleapis.com`
   - `cloudbuild.googleapis.com`
   - `artifactregistry.googleapis.com`
4. creeaza repo-ul Artifact Registry `mydarrin-cloud-run` daca lipseste
5. construieste imaginea backend
6. face deploy la `mydarrin-backend`
7. citeste URL-ul backend-ului nou
8. construieste imaginea backoffice cu `NEXT_PUBLIC_*` injectate corect
9. face deploy la `mydarrin-backoffice`
10. afiseaza URL-urile finale

## Optiuni utile

Deploy complet:

```powershell
.\scripts\deploy_cloud_run.ps1
```

Doar backend:

```powershell
.\scripts\deploy_cloud_run.ps1 -SkipBackoffice
```

Doar backoffice, fara rebuild backend:

```powershell
.\scripts\deploy_cloud_run.ps1 -SkipBackend
```

Redeploy fara rebuild imagini:

```powershell
.\scripts\deploy_cloud_run.ps1 -SkipBuild
```

Schimbare proiect/regiune:

```powershell
.\scripts\deploy_cloud_run.ps1 -ProjectId mydarrin-platform -Region europe-west9
```

## Observatii

- backend-ul foloseste secretele din Secret Manager, nu valori hardcodate in repo
- backoffice-ul primeste automat URL-ul backend-ului proaspat deploy-at
- pentru `NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION`, scriptul genereaza automat header-ul Basic Auth din `GateUsername` si `GatePassword`
- storage-ul pentru atasamente ramane configurat pe GCS
