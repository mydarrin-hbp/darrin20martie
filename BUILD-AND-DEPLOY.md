# My Darrin Mobile Build And Deploy

Acest document acopera build-ul si deploy-ul pentru:

- `mobile-client`
- `mobile-partner`

Stack recomandat:

- Expo 51
- EAS Build
- Android `.apk` pentru QA intern
- Android `.aab` pentru Google Play
- iOS `.ipa` prin EAS + TestFlight

## 1. Cerinte locale

Instaleaza:

- Node.js LTS
- npm
- Expo CLI prin `npx expo`
- EAS CLI prin `npm install -g eas-cli`

Autentificare:

```powershell
eas login
```

## 2. Variabile de mediu productie

In fiecare aplicatie seteaza minim:

```env
EXPO_PUBLIC_API_BASE_URL=https://api.mydarrin.ro
```

Daca vei adauga chei suplimentare pentru analytics, push sau feature flags, pastreaza aceeasi conventie:

```env
EXPO_PUBLIC_SOME_KEY=value
```

Pentru EAS Secrets poti folosi:

```powershell
eas secret:create --scope project --name EXPO_PUBLIC_API_BASE_URL --value https://api.mydarrin.ro
```

Ruleaza separat pentru `mobile-client` si `mobile-partner`.

## 3. Configurare EAS

In fiecare folder mobil:

```powershell
cd mobile-client
npm install
npx eas init
```

respectiv:

```powershell
cd mobile-partner
npm install
npx eas init
```

Genereaza si configureaza `eas.json` cu profile separate, de exemplu:

```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

## 4. Build Android

Pentru build intern `.apk`:

```powershell
cd mobile-client
npx eas build -p android --profile preview
```

Pentru release Play Store:

```powershell
cd mobile-client
npx eas build -p android --profile production
```

Repeta aceleasi comenzi in `mobile-partner`.

Nota:

- pentru QA intern foloseste profil `preview`
- pentru Google Play recomandat este build-ul `production`, de regula `.aab`

## 5. Build iOS

Pentru build iOS:

```powershell
cd mobile-client
npx eas build -p ios --profile production
```

si:

```powershell
cd mobile-partner
npx eas build -p ios --profile production
```

Rezultatul va fi pachetul potrivit pentru TestFlight / App Store Connect.

## 6. Deploy recomandat

Android:

- Google Play Internal Testing pentru testare rapida
- apoi Closed Testing
- apoi Production

iOS:

- TestFlight pentru QA si validare business
- apoi App Store release

## 7. Verificare locala inainte de build

Din radacina proiectului:

```powershell
build_mobile.bat
```

Scriptul face:

- `npm install` in `mobile-client`
- `npm install` in `mobile-partner`
- verificare minima a dependintelor prin `npm ls --depth=0`

## 8. Faze implementate in MVP

1. Faza 1: Auth flow cu JWT + OTP demo + biometrie
2. Faza 2: Catalog + servicii
3. Faza 3: Cos + checkout
4. Faza 4: Comenzi + monitorizare
5. Faza 5: Profil + notificari + sincronizare live

## 9. Ordine recomandata de release

1. publica backend-ul productie
2. seteaza `EXPO_PUBLIC_API_BASE_URL`
3. ruleaza `build_mobile.bat`
4. valideaza login, catalog, checkout, orders, profil
5. construieste `preview` pentru QA
6. construieste `production` pentru store-uri
