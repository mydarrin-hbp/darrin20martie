# Cloud Run Deploy

Acest backend este pregatit pentru:

- Cloud Run
- Cloud SQL PostgreSQL
- Secret Manager

## 1. Variabile de mediu recomandate

```env
DATABASE_URL=postgresql+psycopg://mydarrin_app:YOUR_CLOUD_SQL_PASSWORD@34.155.95.43:5432/mydarrin?sslmode=require
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
BACKEND_CORS_ORIGINS=https://mydarrin.homebestpal.com,https://mydarrin.com
ENABLE_BASIC_AUTH_GATE=true
BASIC_AUTH_GATE_USERNAME=ownergate
BASIC_AUTH_GATE_PASSWORD=HomeBestPal2026!Secure
GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
```

## 2. Build local container

```powershell
cd backend
docker build -t gcr.io/mydarrin-platform/mydarrin-backend .
```

## 3. Deploy cu Cloud Run din sursa

```powershell
cd backend
gcloud run deploy mydarrin-backend `
  --source . `
  --project mydarrin-platform `
  --region europe-west9 `
  --allow-unauthenticated `
  --set-env-vars JWT_ALGORITHM=HS256,JWT_EXPIRATION_HOURS=24,BACKEND_CORS_ORIGINS=https://mydarrin.homebestpal.com,https://mydarrin.com,ENABLE_BASIC_AUTH_GATE=true,BASIC_AUTH_GATE_USERNAME=ownergate,BASIC_AUTH_GATE_PASSWORD=HomeBestPal2026!Secure `
  --set-secrets JWT_SECRET=JWT_SECRET:latest,GOOGLE_API_KEY=GOOGLE_API_KEY:latest,DATABASE_URL=DATABASE_URL:latest
```

## 4. Secret Manager

```powershell
echo "postgresql+psycopg://mydarrin_app:YOUR_CLOUD_SQL_PASSWORD@34.155.95.43:5432/mydarrin?sslmode=require" | gcloud secrets create DATABASE_URL --data-file=-
echo "YOUR_LONG_RANDOM_SECRET" | gcloud secrets create JWT_SECRET --data-file=-
echo "YOUR_GOOGLE_API_KEY" | gcloud secrets create GOOGLE_API_KEY --data-file=-
```

## 5. Verificare dupa deploy

```powershell
gcloud run services describe mydarrin-backend --project mydarrin-platform --region europe-west9
```

Verifica apoi:

- `/health`
- `/docs`
- `python test_cloud_sql_connection.py` cu `DATABASE_URL` real
