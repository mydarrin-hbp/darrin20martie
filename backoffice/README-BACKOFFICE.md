# My Darrin Back Office

Panoul `backoffice` este construit cu:

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Space Grotesk
- JWT admin auth + RBAC in UI

## Pornire

```powershell
cd backoffice
copy .env.local.example .env.local
npm install
npm run dev
```

## Variabile de mediu

```env
NEXT_PUBLIC_API_BASE_URL=https://mydarrin-backend-792782430639.europe-west9.run.app
NEXT_PUBLIC_GATE_USERNAME=ownergate
NEXT_PUBLIC_GATE_PASSWORD=CHANGE_ME
NEXT_PUBLIC_BACKEND_GATE_AUTHORIZATION=Basic CHANGE_ME
```

## Backend live curent

Backend-ul live conectat acum in backoffice este:

- `https://mydarrin-backend-792782430639.europe-west9.run.app`

Credentiale de acces:

- Security Gate:
  - user: `ownergate`
  - parola: `CHANGE_ME`
- Admin app login:
  - email: `admin@example.com`
  - parola: `CHANGE_ME`

## Avertisment securitate

Aplicatia este protejata cu parola pana la deploy-ul final pe Google Platform.
Nu trebuie expusa public pana la terminarea popularii si testarii locale complete.
Prima pagina trebuie sa fie login-ul cu Security Gate.
Platforma ramane protejata cu parola pana la deploy-ul final pe Google Cloud (mydarrin.homebestpal.com pentru testare cu acces pe email gestionat de owner, mydarrin.com pentru live).

## Login admin

Panoul foloseste:

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

Pentru acces trebuie ca userul sa aiba rol:

- `ADMIN`
- sau `SUPER_ADMIN`

## Module

- Dashboard
- Devino Partener
- Catalog Servicii
- Inscriere Clienti
- Devino Investitor
- Configurari Devize
- Management Comenzi
- Profil admin

## Observatie importanta

Panoul este conectat direct la endpointurile backend existente. Acolo unde backend-ul nu expune inca un endpoint dedicat de business, pagina foloseste adaptoare administrative bazate pe API-urile reale deja disponibile si marcheaza clar zona ca operationala/pregatita pentru extindere.

## Testare locala reusita + comanda de pornire

Validarea locala a fost reusita:

- `npm install` executat cu succes
- `npm run dev` pornit cu succes
- pagini verificate local cu raspuns `200`:
  - `/login`
  - `/dashboard`
  - `/partners`
  - `/catalog`
  - `/clients`
  - `/investors`
  - `/deviz-configs`
  - `/orders`
  - `/profile`

Comanda de pornire:

```powershell
cd backoffice
copy .env.local.example .env.local
npm install
npm run dev
```

Pentru mediul curent deja configurat local:

```powershell
cd backoffice
npm run dev
```

Marcaj final:

FINALIZAT & INTEGRAT
