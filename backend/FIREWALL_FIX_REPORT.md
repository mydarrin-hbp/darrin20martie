# Firewall Fix Report

## Status firewall inainte

```text
Public Profile Settings:
State ON
Firewall Policy BlockInbound,AllowOutbound
```

## Incercare creare regula outbound

Comanda rulata:

```powershell
netsh advfirewall firewall add rule name="Cloud SQL MyDarrin" dir=out action=allow protocol=TCP remoteip=34.155.95.43 remoteport=5432
```

Output:

```text
The requested operation requires elevation (Run as administrator).
```

## Status firewall dupa

```text
Public Profile Settings:
State ON
Firewall Policy BlockInbound,AllowOutbound
```

## Output complet migrare

```text
sqlalchemy.exc.OperationalError: (psycopg.OperationalError) connection failed: connection to server at "34.155.95.43", port 5432 failed: Permission denied (0x0000271D/10013)
Is the server running on that host and accepting TCP/IP connections?
```

## Ultimele 5 migratii aplicate

```text
c9d1e2f3a4b5 -> d4e5f6a7b8c9 (head), ai robot darrin rag full
a7b9c2d4e5f6 -> c9d1e2f3a4b5, ai robot darrin feedback
f4c6d8a1b2e3 -> a7b9c2d4e5f6, deviz engine v1
e1a2f8c9b7d1 -> f4c6d8a1b2e3, cost engine v1
dc1d51e2647d -> e1a2f8c9b7d1, service subcategories many to many
```

## Connection string folosit

```env
postgresql+psycopg://mydarrin_app:***@34.155.95.43:5432/mydarrin?sslmode=require
```

## Comanda finala de deploy Cloud Run

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

## Status final

ERROR

Conexiunea catre Cloud SQL ramane blocata la nivel de acces TCP sau politica locala de securitate, iar regula firewall outbound nu a putut fi adaugata fara elevare administrativa reala.
