# Deploy Checklist: mydarrin.homebestpal.com

> IMPORTANT: Nu se ruleaza deploy pe GCP pana nu exista aprobarea explicita pentru testul local complet.

## Fisiere pregatite

- [\.env.mydarrin.production](/c:/Users/admin/Desktop/mydarrin-platform/infra/gcp/.env.mydarrin.production)
- [backend.env.yaml](/c:/Users/admin/Desktop/mydarrin-platform/infra/gcp/cloud-run/backend.env.yaml)
- [frontend.env.yaml](/c:/Users/admin/Desktop/mydarrin-platform/infra/gcp/cloud-run/frontend.env.yaml)
- [backoffice.env.yaml](/c:/Users/admin/Desktop/mydarrin-platform/infra/gcp/cloud-run/backoffice.env.yaml)
- [deploy-mydarrin.ps1](/c:/Users/admin/Desktop/mydarrin-platform/infra/gcp/deploy-mydarrin.ps1)
- [configure-dns.ps1](/c:/Users/admin/Desktop/mydarrin-platform/infra/gcp/configure-dns.ps1)

## Checklist de executie

1. Verifica si inlocuieste placeholder-ele:
   - `GOOGLE_API_KEY`
   - `GEMINI_API_KEY`
   - `BACKEND_GATE_AUTHORIZATION`
   - `NEXT_PUBLIC_GATE_USERNAME`
   - `NEXT_PUBLIC_GATE_PASSWORD`
   - `BASIC_AUTH_GATE_USERNAME`
   - `BASIC_AUTH_GATE_PASSWORD`
   - `JWT_SECRET`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USERNAME`
   - `SMTP_PASSWORD`
   - `SMTP_SENDER`
   - `NEXT_PUBLIC_CANONICAL_HOST`
   - `NEXT_PUBLIC_FORCE_HTTPS`
2. Autentificare GCP:
   ```powershell
   gcloud auth login
   gcloud auth application-default login
   gcloud config set project mydarrin-platform
   ```
3. Ruleaza deploy-ul serviciilor:
   ```powershell
   .\infra\gcp\deploy-mydarrin.ps1 -EnvFile .\infra\gcp\.env.mydarrin.production
   ```
4. Configureaza DNS:
   ```powershell
   .\infra\gcp\configure-dns.ps1 -ProjectId mydarrin-platform -ZoneName homebestpal-zone
   ```
5. Scriptul de deploy creeaza acum automat maparile de domeniu pentru:
   - `mydarrin.homebestpal.com -> mydarrin-frontend`
   - `admin.mydarrin.homebestpal.com -> mydarrin-backoffice`
   - `api.mydarrin.homebestpal.com -> mydarrin-backend`
   Daca vrei verificare manuala:
   ```powershell
   gcloud beta run domain-mappings list --region=europe-west3
   ```
6. Verifica sanatatea serviciilor:
   ```powershell
   curl https://api.mydarrin.homebestpal.com/health
   curl https://mydarrin.homebestpal.com
   curl https://admin.mydarrin.homebestpal.com
   ```
7. Verifica fluxul functional:
   - login gate public
   - homepage publica
   - editare `Homepage Builder`
   - refresh homepage publica
   - verificare `Reparat calorifer`
8. Configureaza bucket-ul GCS pentru media:
   - `mydarrin-secure-attachments` + acces Cloud Run service account.
9. Configureaza Cloud SQL production:
   - aplica migrarile
   - ruleaza scriptul de cleanup demo (cu `--apply` doar dupa aprobarea finala).
10. Activeaza SSL + HTTPS forced:
   - verifica HSTS si CSP in response headers.
11. Activeaza monitorizare:
   - alerte pentru latenta, erori 5xx si conexiuni DB.
12. Pregateste DNS final:
   - `www.mydarrin.com` + redirect 301 catre canonical.
