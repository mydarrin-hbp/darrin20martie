# My Darrin Mobile

Structura mobila este impartita in doua aplicatii Expo 51:

- `mobile-client` pentru clienti
- `mobile-partner` pentru parteneri

Ambele folosesc:

- React Native + Expo 51
- JWT login catre backend-ul FastAPI
- OTP demo local pana la expunerea endpointului OTP in backend
- biometrie prin `expo-local-authentication`
- token storage prin `expo-secure-store`
- `axios` cu `baseURL` din `.env`
- tema My Darrin cu Space Grotesk si paleta identica cu web
- suport multilingv `RO/EN`

## Pornire rapida

Pentru aplicatia client:

```powershell
cd mobile-client
copy .env.example .env
npm install
npx expo start
```

Pentru aplicatia partener:

```powershell
cd mobile-partner
copy .env.example .env
npm install
npx expo start
```

## Setare backend URL

In fiecare aplicatie exista fisierul `.env.example`.

Seteaza:

```env
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Pentru dispozitive fizice, inlocuieste `127.0.0.1` cu IP-ul masinii pe care ruleaza backend-ul.

## Avertisment securitate

Aplicatia este protejata cu parola pana la deploy-ul final pe Google Platform.
Preview-ul Expo nu trebuie expus public pana la terminarea popularii si testarii locale complete.
Platforma ramane protejata cu parola pana la deploy-ul final pe Google Cloud (mydarrin.homebestpal.com pentru testare cu acces pe email gestionat de owner, mydarrin.com pentru live).

## Flux implementat acum

1. `Login` cu email + parola
2. `OTP` demo cu codul `123456`
3. activare optionala biometrie
4. intrare in dashboard-ul de baza

Endpointul real folosit acum este:

```text
POST /api/v1/auth/login
```

## Roadmap faze

1. Auth
2. Catalog
3. Cos
4. Comenzi

## Faza 2 - Catalog implementat

Ambele aplicatii includ acum:

- `CatalogScreen` cu lista de servicii din `GET /api/v1/catalog/services`
- `ServiceDetailScreen` cu detaliu serviciu din `GET /api/v1/catalog/services/{id}`
- niveluri vizuale `Bronz / Argint / Aur / Platinum`
- buton `Adauga in cos` pregatit pentru Faza 3
- acces din `Home` catre `Catalog`

## Faza 3 - Cos + Checkout implementat

Ambele aplicatii includ acum:

- `cartStore.ts` cu `addToCart`, `removeFromCart`, `updateLevel`, `clearCart`
- `CartScreen` cu servicii adaugate, selectie nivel si subtotal
- `CheckoutScreen` cu rezumat, adresa prestare si confirmare demo
- integrare reala din `ServiceDetailScreen` catre store-ul de cos
- navigare din `Home` catre `Cart` si din `Cart` catre `Checkout`

## Faza 4 - Comenzi + Monitorizare implementat

Ambele aplicatii includ acum:

- `OrdersScreen` cu lista de comenzi si status `Pending / In Progress / Completed`
- `OrderDetailScreen` cu detalii, status live, adresa, niveluri si total
- `getOrders()` si `getOrderById()` in `services/api.ts`
- fallback demo pana cand backend-ul expune endpointurile reale `/api/v1/orders`
- `orderStore.ts` pentru comenzile create local dupa checkout
- acces din `Home` catre `Comenzile mele`

## Faza 5 - Profil + Notificari + Sincronizare implementat

Ambele aplicatii includ acum:

- `ProfileScreen` cu editare demo date, toggle biometrie, logout si versiune app
- notificari locale prin `expo-notifications`
- notificare imediata la confirmarea checkout-ului
- sincronizare live la fiecare 30 secunde prin `getOrders()`
- actualizare `orderStore` si tranzitii locale `PENDING -> IN_PROGRESS -> COMPLETED`
- buton `Profil` in `Home` si ruta noua in `AppNavigator`

## MVP Finalizat - Build & Deploy

Pachetul mobil este gata pentru build si distributie controlata.

Foloseste:

- `build_mobile.bat` pentru verificare locala si instalare dependinte
- `BUILD-AND-DEPLOY.md` pentru pasii completi Android / iOS / EAS
- `PROJECT-SUMMARY.md` pentru sumarul final backend + mobile + deploy
- `backoffice/README-BACKOFFICE.md` pentru pornirea si folosirea panoului web admin
- `SECURITY-GATE.md` pentru statusul protectiei pe backend, backoffice si mobile
- `run_mobile.bat` pentru rulare locala in dezvoltare

## Pornire simultana

Din radacina proiectului:

```powershell
run_mobile.bat
```

Scriptul deschide doua ferestre separate:

- `mobile-client`
- `mobile-partner`
