# Production Hardening - My Darrin

Acest document pregateste lansarea pe GCP. Nu se executa fara aprobarea explicita dupa testele locale.

## 1. Pipeline zero-downtime
- Cloud Run suporta zero-downtime implicit (deploy inlocuieste revision si muta trafic).
- Recomandare: `--min-instances=1` pentru a elimina cold-start.

## 2. Media storage (GCS)
- Bucket: `mydarrin-secure-attachments`
- Prefix: `attachments`
- Setare backend: `ATTACHMENTS_STORAGE_BACKEND=gcs`
- Verifica permisiunea service account Cloud Run: `roles/storage.objectAdmin`.

## 3. Cloud SQL
- Instanta: `mydarrin-platform:europe-west9:mydarrin-db`
- Conexiune: `DATABASE_URL` cu socket Cloud SQL.

## 4. SSL + HTTPS forced
- Domain mapping Cloud Run genereaza automat SSL.
- Seteaza `NEXT_PUBLIC_CANONICAL_HOST` + `NEXT_PUBLIC_FORCE_HTTPS=true`.

## 5. DNS final
- `mydarrin.homebestpal.com` ramane host de staging.
- `www.mydarrin.com` devine canonical.
- Redirect 301 din staging catre `www` dupa aprobarea finala.

## 6. Monitoring & alerting
- Alerta latenta: p95 > 800ms (5 min).
- Alerta rate 5xx: > 1% (5 min).
- Alerta DB: conexiuni > 80% din max.

## 7. Cleanup date demo
- Ruleaza `cleanup_demo_data.py --apply` numai dupa backup.
