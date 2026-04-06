# Security Gate

Status general: ACTIV

Toate aplicatiile My Darrin sunt protejate pana la deploy-ul final pe Google Platform.
Platforma ramane protejata cu parola pana la deploy-ul final pe Google Cloud (mydarrin.homebestpal.com pentru testare cu acces pe email gestionat de owner, mydarrin.com pentru live).

## Backend

- Protectie: Basic Auth gate optional, activabil din env
- Stare: [ACTIVE]
- Headers acceptate:
  - `Authorization: Basic ...`
  - `X-Gate-Authorization: Basic ...`
- Creds demo:
  - user: `ownergate`
  - pass: `HomeBestPal2026!Secure`

## Backoffice

- Protectie: Security Gate obligatoriu in pagina de login
- Stare: [ACTIVE]
- Strat 1: username + parola de gate
- Strat 2: login admin JWT + RBAC
- Creds demo gate:
  - user: `ownergate`
  - pass: `HomeBestPal2026!Secure`

## Mobile Client

- Protectie: Preview Gate obligatoriu inainte de navigator
- Stare: [ACTIVE]
- Creds demo gate:
  - user: `ownergate`
  - pass: `HomeBestPal2026!Secure`

## Mobile Partner

- Protectie: Preview Gate obligatoriu inainte de navigator
- Stare: [ACTIVE]
- Creds demo gate:
  - user: `ownergate`
  - pass: `HomeBestPal2026!Secure`

## Marcaj final

Aplicatiile NU sunt vizibile public pentru uz normal pana la terminarea popularii si testarii locale complete.
