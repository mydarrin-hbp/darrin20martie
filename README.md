# My Darrin Platform

My Darrin include:

- backend FastAPI
- Catalog `Domain -> Category -> SubCategory -> Service`
- Cost Engine v1
- Deviz Engine v1
- AI Robot Darrin cu RAG din back-office, feedback loop si suport Gemini 2.5 Flash
- frontend starter Next.js pentru apelul `/api/v1/ai/interpret`

## 1. Instalare

Din radacina proiectului:

```powershell
python -m pip install -r backend/requirements.txt
python -m alembic upgrade head
cd backend
python -m app.scripts.seed_demo_full
```

Fisierul de configurare exemplu este [backend/.env.example](C:/Users/admin/Desktop/mydarrin-platform/backend/.env.example).

## 2. Configurare `.env`

In `backend/.env` trebuie sa existe cel putin:

```env
DATABASE_URL=sqlite:///./mydarrin.db
JWT_SECRET=mydarrin-super-secure-jwt-secret-2026-auth-rbac-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

Pentru Gemini 2.5 Flash poti seta oricare dintre chei:

```env
GOOGLE_API_KEY=your_real_key_here
```

sau:

```env
GEMINI_API_KEY=your_real_key_here
```

Daca niciuna nu este setata, `AI Robot Darrin` foloseste fallback local si continua sa ruleze cu:

- RAG din back-office
- Cost Engine
- Deviz Engine
- learning snapshot

## 3. Pornire backend

Pe Windows, varianta stabila este fara `--reload`.

Avertisment securitate:

- Platforma ramane protejata cu parola pana la deploy-ul final pe Google Cloud (mydarrin.homebestpal.com pentru testare cu acces pe email gestionat de owner, mydarrin.com pentru live).

Comanda recomandata:

```powershell
cd backend
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Observatie importanta:

- `uvicorn --reload` poate produce `WinError 5` pe Windows in anumite medii
- pentru dezvoltare stabila foloseste comanda de mai sus, fara reloader

Swagger:

```text
http://127.0.0.1:8000/docs
```

## 4. Credentiale demo

Seed-ul creeaza adminul demo:

```text
control.admin@mydarrin.ro
ControlRoom2026!Admin
```

## 5. Login admin si token

```powershell
$headers = @{ "X-Gate-Authorization" = "Basic b3duZXJnYXRlOkhvbWVCZXN0UGFsMjAyNiFTZWN1cmU=" }

$login = Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8000/api/v1/auth/login" `
  -Headers $headers `
  -ContentType "application/json" `
  -Body '{"email":"control.admin@mydarrin.ro","password":"ControlRoom2026!Admin"}'

$token = $login.access_token
```

## 6. Exemplu real `/api/v1/ai/interpret`

```powershell
$body = @{
  service_id = 1
  country_id = 1
  zone_id = 1
  currency = "RON"
  legislation_code = "RO-STD"
  message = "Am nevoie urgent de montaj centrala termica pentru un apartament in Bucuresti."
  urgency = $true
  service_level = "STANDARD"
  resources = @(
    @{
      resource_type = "EQUIPMENT"
      name = "Kit montaj centrala"
      unit = "set"
      quantity = 1
      unit_cost = 650
    },
    @{
      resource_type = "LABOR"
      name = "Manopera instalare"
      unit = "ora"
      quantity = 6
      unit_cost = 120
    }
  )
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8000/api/v1/ai/interpret" `
  -Headers @{ Authorization = "Bearer $token"; "X-Gate-Authorization" = "Basic b3duZXJnYXRlOkhvbWVCZXN0UGFsMjAyNiFTZWN1cmU=" } `
  -ContentType "application/json" `
  -Body $body
```

Raspunsul include:

- `provider`
- `provider_reason`
- `warnings`
- `model`
- `confidence`
- `follow_up_questions`
- `rag_context`
- `rag_sources`
- `learning_snapshot`
- `deviz`

## 7. Smoke test

Din `backend`:

```powershell
python test_smoke.py
```

Smoke test-ul verifica live:

- `/health`
- `/api/v1/auth/login`
- `/api/v1/ai/interpret`
- `/api/v1/deviz/generate`

## 8. Teste automate

Din `backend`:

```powershell
python -m pytest tests/ -q --tb=short
```

## 9. Frontend starter

Din `frontend`:

```powershell
npm install
npm run dev
```

Frontendul minim este in [frontend](C:/Users/admin/Desktop/mydarrin-platform/frontend) si face apel la `/api/v1/ai/interpret`.

## 10. Pornire completa dintr-o singura comanda

Din radacina proiectului:

```powershell
run_production.bat
```

Scriptul:

- instaleaza dependentele backend
- ruleaza migrarile
- ruleaza seed-ul complet
- porneste backend-ul stabil, fara `--reload`
