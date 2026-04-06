# My Darrin: Plan de Executie GCP + Implementare Full-Stack

## Scop

Acest document transforma mockup-urile aprobate My Darrin intr-o arhitectura executabila pentru:

- `mydarrin.homebestpal.com` ca subdomeniu de staging/protected access
- `www.mydarrin.com` ca domeniu public final
- sincronizare `Backoffice -> API -> Frontend public`
- deployment automat din Cloud Build catre Cloud Run

## Arhitectura propusa

### Servicii

- `frontend`: Next.js public app pentru Home Page si paginile comerciale
- `backoffice`: Next.js admin panel
- `backend`: FastAPI + SQLAlchemy pentru API, auth, catalog, pricing, homepage builder
- `Cloud SQL PostgreSQL`: date tranzactionale si CMS config
- `Cloud Storage`: media si atasamente
- `Cloud DNS`: subdomenii si managed zone
- `Cloud Run`: runtime pentru toate serviciile web
- `Cloud Build`: build si deploy pipeline

### Separare in workspace

- [frontend](/c:/Users/admin/Desktop/mydarrin-platform/frontend)
- [backoffice](/c:/Users/admin/Desktop/mydarrin-platform/backoffice)
- [backend](/c:/Users/admin/Desktop/mydarrin-platform/backend)
- [infra/gcp/cloudbuild.yaml](/c:/Users/admin/Desktop/mydarrin-platform/infra/gcp/cloudbuild.yaml)
- [cloudbuild.yaml](/c:/Users/admin/Desktop/mydarrin-platform/cloudbuild.yaml)

## Etapa 1: Infrastructura GCP si DNS

### 1. Cloud DNS pentru subdomeniu

1. In proiectul GCP activ, creezi sau folosesti managed zone pentru `homebestpal.com`.
2. Adaugi in zona existenta inregistrari pentru:
   - `mydarrin.homebestpal.com` -> endpoint-ul frontend Cloud Run / load balancer
   - `api.mydarrin.homebestpal.com` -> backend Cloud Run
   - `admin.mydarrin.homebestpal.com` -> backoffice Cloud Run
3. Daca vrei delegare separata pentru subdomeniu, creezi managed zone pentru `mydarrin.homebestpal.com` si adaugi NS records in zona parinte.

Comenzi utile:

```powershell
gcloud dns managed-zones list
gcloud dns record-sets transaction start --zone=homebestpal-zone
gcloud dns record-sets transaction add ghs.googlehosted.com. --name="mydarrin.homebestpal.com." --ttl=300 --type=CNAME --zone=homebestpal-zone
gcloud dns record-sets transaction add ghs.googlehosted.com. --name="admin.mydarrin.homebestpal.com." --ttl=300 --type=CNAME --zone=homebestpal-zone
gcloud dns record-sets transaction add ghs.googlehosted.com. --name="api.mydarrin.homebestpal.com." --ttl=300 --type=CNAME --zone=homebestpal-zone
gcloud dns record-sets transaction execute --zone=homebestpal-zone
```

Script pregatit:

- [configure-dns.ps1](/c:/Users/admin/Desktop/mydarrin-platform/infra/gcp/configure-dns.ps1)

### 2. Runtime recomandat

- `frontend` -> Cloud Run
- `backoffice` -> Cloud Run
- `backend` -> Cloud Run
- `attachments/media` -> Cloud Storage bucket separat

Bucket recomandat:

- `gs://mydarrin-public-assets`
- `gs://mydarrin-secure-attachments`

### 3. SSL/TLS

Pentru productie recomand:

- HTTPS Load Balancer + serverless NEG pentru `frontend`, `backoffice`, `backend`
- Google-managed SSL certificates atasate pe domenii/subdomenii

Mapping recomandat:

- `mydarrin.homebestpal.com` -> frontend
- `admin.mydarrin.homebestpal.com` -> backoffice
- `api.mydarrin.homebestpal.com` -> backend

Comenzi utile:

```powershell
gcloud run domain-mappings create --service=mydarrin-frontend --domain=mydarrin.homebestpal.com --region=europe-west3
gcloud run domain-mappings create --service=mydarrin-backoffice --domain=admin.mydarrin.homebestpal.com --region=europe-west3
gcloud run domain-mappings create --service=mydarrin-backend --domain=api.mydarrin.homebestpal.com --region=europe-west3
```

## Etapa 2: Aliniere tehnica in cod

### 1. Config comun

Fisierul de configurare pentru medii este:

- [infra/gcp/runtime-config.example.json](/c:/Users/admin/Desktop/mydarrin-platform/infra/gcp/runtime-config.example.json)
- [infra/gcp/.env.mydarrin.example](/c:/Users/admin/Desktop/mydarrin-platform/infra/gcp/.env.mydarrin.example)
- [infra/gcp/.env.mydarrin.production](/c:/Users/admin/Desktop/mydarrin-platform/infra/gcp/.env.mydarrin.production)
- [infra/gcp/cloud-run/backend.env.yaml](/c:/Users/admin/Desktop/mydarrin-platform/infra/gcp/cloud-run/backend.env.yaml)
- [infra/gcp/cloud-run/frontend.env.yaml](/c:/Users/admin/Desktop/mydarrin-platform/infra/gcp/cloud-run/frontend.env.yaml)
- [infra/gcp/cloud-run/backoffice.env.yaml](/c:/Users/admin/Desktop/mydarrin-platform/infra/gcp/cloud-run/backoffice.env.yaml)

Acestea definesc:

- URL-urile publice
- gate auth temporar
- Cloud SQL
- Cloud Storage
- politicile de sincronizare pentru Homepage Builder

### 2. Mapping Backoffice -> Public

Fluxul implementat:

1. Backoffice editeaza homepage in `Homepage Builder`
2. Backoffice salveaza prin `PUT /api/v1/backoffice/site-content/homepage`
3. Backend persista in tabelul `site_content_pages`
4. Frontend public citeste `GET /api/v1/public/pages/homepage`
5. Frontend randeaza fara cache continutul salvat

### 3. Schema de date introdusa

Tabela noua:

- `site_content_pages`

Campuri:

- `slug`
- `title`
- `status`
- `content` JSON
- `notes`
- `created_at`
- `updated_at`

Aceasta tabela este gandita ca un CMS simplu pentru:

- homepage
- landing pages
- viitoare pagini de campanie

## Etapa 3: Implementare functionala

### Backend

Modulul nou introdus:

- [backend/app/modules/site_content/models.py](/c:/Users/admin/Desktop/mydarrin-platform/backend/app/modules/site_content/models.py)
- [backend/app/modules/site_content/router.py](/c:/Users/admin/Desktop/mydarrin-platform/backend/app/modules/site_content/router.py)
- [backend/app/modules/site_content/service.py](/c:/Users/admin/Desktop/mydarrin-platform/backend/app/modules/site_content/service.py)

Endpoint-uri:

- `GET /api/v1/public/pages/homepage`
- `GET /api/v1/backoffice/site-content/homepage`
- `PUT /api/v1/backoffice/site-content/homepage`

### Frontend public

Homepage publica este conectata la API prin:

- [frontend/lib/site-content.ts](/c:/Users/admin/Desktop/mydarrin-platform/frontend/lib/site-content.ts)
- [frontend/components/public-homepage.tsx](/c:/Users/admin/Desktop/mydarrin-platform/frontend/components/public-homepage.tsx)
- [frontend/app/page.tsx](/c:/Users/admin/Desktop/mydarrin-platform/frontend/app/page.tsx)

Strategie:

- fetch server-side
- `cache: "no-store"`
- fallback local daca backend-ul nu raspunde

### Backoffice

Intrarea admin pentru editare:

- [backoffice/components/homepage-builder-admin-page.tsx](/c:/Users/admin/Desktop/mydarrin-platform/backoffice/components/homepage-builder-admin-page.tsx)
- [backoffice/app/(protected)/admin/design-system/homepage-builder/page.tsx](/c:/Users/admin/Desktop/mydarrin-platform/backoffice/app/(protected)/admin/design-system/homepage-builder/page.tsx)

API helpers:

- [backoffice/lib/api.ts](/c:/Users/admin/Desktop/mydarrin-platform/backoffice/lib/api.ts)

## Etapa 4: Deploy pipeline

Pipeline-ul central este in:

- [cloudbuild.yaml](/c:/Users/admin/Desktop/mydarrin-platform/cloudbuild.yaml)

Versiunea organizata pe infrastructura:

- [infra/gcp/cloudbuild.yaml](/c:/Users/admin/Desktop/mydarrin-platform/infra/gcp/cloudbuild.yaml)

Acest pipeline:

- build-eaza imagini pentru `backend`, `frontend`, `backoffice`
- publica in Artifact Registry
- face deploy pe Cloud Run
- seteaza env vars critice pentru API/base URLs/gate

Script executabil local:

- [deploy-mydarrin.ps1](/c:/Users/admin/Desktop/mydarrin-platform/infra/gcp/deploy-mydarrin.ps1)
- [DEPLOY-CHECKLIST-MYDARRIN.md](/c:/Users/admin/Desktop/mydarrin-platform/infra/gcp/DEPLOY-CHECKLIST-MYDARRIN.md)

Comanda recomandata:

```powershell
.\infra\gcp\deploy-mydarrin.ps1 -ProjectId mydarrin-platform -Region europe-west3 -ArtifactRepo mydarrin
```

## Recomandare de rollout

### Sprint 1

- finalizezi env vars si secrete
- deploy backend
- deploy frontend public
- conectezi subdomeniul de staging

Secventa practica:

```powershell
gcloud auth login
gcloud auth application-default login
.\infra\gcp\deploy-mydarrin.ps1
.\infra\gcp\configure-dns.ps1
```

### Sprint 2

- deploy backoffice
- activezi Homepage Builder real
- mutare atasamente in bucket dedicat

### Sprint 3

- custom domains finale
- load balancer + managed certs
- monitoring, alerts, logging si CDN

## Observatii

- modelul CMS introdus este minim si extensibil
- pentru productie serioasa, urmatorul pas logic este migrare Alembic dedicata pentru `site_content_pages`
- pentru realtime strict, poti adauga WebSocket/SSE sau invalidare cache/tag revalidation
