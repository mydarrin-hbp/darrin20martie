# Google Cloud Deploy

Acest document descrie deploy-ul recomandat pentru platforma My Darrin pe Google Cloud Platform.

## 1. Domenii si regula de securitate

Regula owner:

- platforma ramane protejata cu parola pana la deploy-ul final
- mediul de test este `mydarrin.homebestpal.com`
- accesul pe mediul de test este controlat exclusiv de owner prin whitelist de email-uri
- domeniul oficial live este `mydarrin.com`
- Security Gate se dezarmeaza doar dupa deploy-ul live final si dupa aprobarea explicita a owner-ului

## 2. Arhitectura recomandata Google Cloud

### Backend

- Cloud Run pentru API FastAPI
- Cloud SQL PostgreSQL pentru baza de date
- Secret Manager pentru chei si secrete
- Cloud Build pentru build/deploy automat

### Backoffice

- Cloud Run pentru aplicatia Next.js
- acces protejat prin Identity-Aware Proxy sau Cloud Run IAM + Access Context
- domeniu de test: `mydarrin.homebestpal.com`

### Mobile

- EAS Build pentru iOS si Android
- TestFlight pentru iOS
- Google Play Internal Testing pentru Android

## 3. Backend pe Cloud Run + Cloud SQL

### Pas 1. Creeaza proiectul GCP

```powershell
gcloud projects create mydarrin-prod
gcloud config set project mydarrin-prod
```

### Pas 2. Activeaza serviciile

```powershell
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Pas 3. Creeaza instanta Cloud SQL PostgreSQL

```powershell
gcloud sql instances create mydarrin-postgres `
  --database-version=POSTGRES_15 `
  --cpu=2 `
  --memory=8GiB `
  --region=europe-west3

gcloud sql databases create mydarrin --instance=mydarrin-postgres
gcloud sql users create mydarrin --instance=mydarrin-postgres --password=CHANGE_ME
```

### Pas 4. Secrete productie

Stocheaza in Secret Manager:

- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_API_KEY` sau `GEMINI_API_KEY`
- `ENABLE_BASIC_AUTH_GATE`
- `BASIC_AUTH_GATE_USERNAME`
- `BASIC_AUTH_GATE_PASSWORD`

Exemplu:

```powershell
echo "postgresql+psycopg://mydarrin:CHANGE_ME@/mydarrin?host=/cloudsql/PROJECT:REGION:INSTANCE" | gcloud secrets create database-url --data-file=-
echo "CHANGE_ME_LONG_RANDOM_SECRET" | gcloud secrets create jwt-secret --data-file=-
```

### Pas 5. Deploy backend pe Cloud Run

Containerul trebuie sa:

- ruleze migrarile Alembic
- porneasca Uvicorn fara `--reload`

Exemplu deploy:

```powershell
gcloud run deploy mydarrin-backend `
  --source ./backend `
  --region europe-west3 `
  --allow-unauthenticated `
  --add-cloudsql-instances PROJECT:REGION:INSTANCE `
  --set-secrets DATABASE_URL=database-url:latest,JWT_SECRET=jwt-secret:latest `
  --set-secrets GOOGLE_API_KEY=google-api-key:latest `
  --set-env-vars ENABLE_BASIC_AUTH_GATE=true,BASIC_AUTH_GATE_USERNAME=ownergate,BASIC_AUTH_GATE_PASSWORD=HomeBestPal2026!Secure
```

## 4. Backoffice pe Cloud Run

### Pas 1. Variabile productie

- `NEXT_PUBLIC_API_BASE_URL=https://api-test.mydarrin.homebestpal.com` sau URL-ul backend-ului de test
- `NEXT_PUBLIC_GATE_USERNAME=ownergate`
- `NEXT_PUBLIC_GATE_PASSWORD=HomeBestPal2026!Secure`
- `NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION=Basic ...`

### Pas 2. Deploy

```powershell
gcloud run deploy mydarrin-backoffice `
  --source ./backoffice `
  --region europe-west3 `
  --allow-unauthenticated `
  --set-env-vars NEXT_PUBLIC_API_BASE_URL=https://api-test.mydarrin.homebestpal.com,NEXT_PUBLIC_GATE_USERNAME=ownergate,NEXT_PUBLIC_GATE_PASSWORD=HomeBestPal2026!Secure,NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION=Basic_YOUR_VALUE
```

## 5. Subdomain test parolat + acces pe email

Pentru `mydarrin.homebestpal.com` recomandarea este:

1. maparea domeniului catre serviciul Cloud Run relevant
2. activarea accesului prin Identity-Aware Proxy sau Cloud Run IAM
3. owner-ul gestioneaza whitelist-ul de email-uri

Model recomandat:

- owner-ul adauga doar email-urile aprobate
- tot traficul catre mediul de test cere:
  - autentificare Google pe email aprobat
  - Security Gate activ in aplicatie

Aceasta combinatie ofera:

- acces pe email controlat de owner
- parola suplimentara la nivel de aplicatie
- zero expunere publica reala inainte de lansare

## 6. Domeniul oficial live mydarrin.com

Pentru live:

1. mapare domeniu `mydarrin.com` si subdomenii API/backoffice
2. certificate SSL gestionate in Google Cloud
3. dupa aprobarea owner-ului:
   - se poate dezarma Security Gate
   - se poate inlocui gate-ul cu autentificare normala + RBAC + rate limiting + WAF

## 7. Mobile pe EAS Build

### iOS

- build prin EAS
- distribuire prin TestFlight

```powershell
cd mobile-client
npx eas build -p ios --profile production
```

```powershell
cd mobile-partner
npx eas build -p ios --profile production
```

### Android

- build prin EAS
- distribuire prin Google Play Internal Testing

```powershell
cd mobile-client
npx eas build -p android --profile production
```

```powershell
cd mobile-partner
npx eas build -p android --profile production
```

## 8. Variabile de mediu productie

### Backend

```env
DATABASE_URL=postgresql+psycopg://...
JWT_SECRET=very_long_random_secret
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
GOOGLE_API_KEY=...
ENABLE_BASIC_AUTH_GATE=true
BASIC_AUTH_GATE_USERNAME=ownergate
BASIC_AUTH_GATE_PASSWORD=HomeBestPal2026!Secure
```

### Backoffice

```env
NEXT_PUBLIC_API_BASE_URL=https://api-test.mydarrin.homebestpal.com
NEXT_PUBLIC_GATE_USERNAME=ownergate
NEXT_PUBLIC_GATE_PASSWORD=HomeBestPal2026!Secure
NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION=Basic ...
```

### Mobile

```env
EXPO_PUBLIC_API_BASE_URL=https://api-test.mydarrin.homebestpal.com
EXPO_PUBLIC_PREVIEW_GATE_USERNAME=ownergate
EXPO_PUBLIC_PREVIEW_GATE_PASSWORD=HomeBestPal2026!Secure
EXPO_PUBLIC_BACKEND_GATE_AUTHORIZATION=Basic ...
```

## 9. Dezamorsare Security Gate

Security Gate NU se scoate:

- nici in popularea initiala
- nici in testarea interna
- nici in mediul de test protejat

Security Gate se dezarmeaza doar:

1. dupa deploy live complet
2. dupa validarea finala owner
3. dupa confirmarea ca whitelist-ul de email si accesul operational sunt stabilizate

## 10. Ordine recomandata

1. populeaza complet mediul local
2. valideaza local backend + backoffice + mobile
3. deploy backend pe Cloud Run + Cloud SQL
4. deploy backoffice pe Cloud Run
5. configureaza `mydarrin.homebestpal.com`
6. activeaza accesul pe email whitelist gestionat de owner
7. ruleaza testare inchisa
8. construieste aplicatiile mobile prin EAS
9. distribuie TestFlight + Google Play Internal Testing
10. pregateste `mydarrin.com` pentru live
