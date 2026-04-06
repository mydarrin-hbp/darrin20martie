# Migration Cloud SQL Final

## Status migrare

ERROR

## Output complet proxy

```text
2026/03/22 07:52:18 Authorizing with Application Default Credentials
2026/03/22 07:52:18 Error starting proxy: error initializing dialer: failed to create default credentials: credentials: could not find default credentials. See https://cloud.google.com/docs/authentication/external/set-up-adc for more information
2026/03/22 07:52:18 The proxy has encountered a terminal error: unable to start: error initializing dialer: failed to create default credentials: credentials: could not find default credentials. See https://cloud.google.com/docs/authentication/external/set-up-adc for more information
```

## Output complet alembic upgrade head

```text
sqlalchemy.exc.OperationalError: (psycopg.OperationalError) connection failed: connection to server at "34.155.95.43", port 5432 failed: Permission denied (0x0000271D/10013)
```

## Output test_cloud_sql_connection.py

```text
[1/4] Pregatesc conexiunea SQLAlchemy...
DATABASE_URL: postgresql+psycopg://mydarrin_app:***@34.155.95.43:5432/mydarrin?sslmode=require
[2/4] Deschid conexiunea catre Cloud SQL...
Eroare OperationalError: (psycopg.OperationalError) connection failed: connection to server at "34.155.95.43", port 5432 failed: Permission denied (0x0000271D/10013)
```

## Ultimele 10 migratii

```text
c9d1e2f3a4b5 -> d4e5f6a7b8c9 (head), ai robot darrin rag full
a7b9c2d4e5f6 -> c9d1e2f3a4b5, ai robot darrin feedback
f4c6d8a1b2e3 -> a7b9c2d4e5f6, deviz engine v1
e1a2f8c9b7d1 -> f4c6d8a1b2e3, cost engine v1
dc1d51e2647d -> e1a2f8c9b7d1, service subcategories many to many
<base> -> dc1d51e2647d, catalog add slug fields baseline
```

## Connection string prin proxy

```env
postgresql+psycopg://mydarrin_app:***@localhost:5432/mydarrin
```

## Blocaj real

Proxy-ul ruleaza ca binar, dar nu poate autoriza conexiunea spre Cloud SQL deoarece in sesiunea curenta lipsesc Application Default Credentials.

Trebuie una dintre variante:

1. `gcloud auth application-default login`
2. sau un fisier service account si pornire proxy cu:

```powershell
.\cloud-sql-proxy.exe --credentials-file C:\path\to\service-account.json --port 5432 mydarrin-platform:europe-west9:mydarrin-db
```

## Comanda finala de deploy pe Cloud Run

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
