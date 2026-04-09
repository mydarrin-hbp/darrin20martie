# My Darrin Design Development, Testing And Implementation Plan

## 1. Document purpose

Acest document defineste directia de design, dezvoltare, testare si implementare pentru platforma `My Darrin`, cu lansare publica pe `www.mydarrin.com` si rulare temporara pe subdomeniul `mydarrin.homebestpal.com`.

Documentul porneste de la mostenirea vizuala `HomeBestPal`, dar stabileste clar noua identitate:

- brand principal produs: `My Darrin`
- slogan: `Home Best Pal`
- inteligenta artificiala: `Darrin AI`
- business principal: `Home Best Pal LTD (UK)`
- website business: `www.homebestpal.com`

Obiectivul etapei 1 este livrarea si aprobarea unui `mockup pentru Home Page`. Dupa aprobare, mockup-ul devine baza pentru implementarea functionala in ecosistemul existent My Darrin.

## 2. Brand and positioning

### 2.1 Product identity

- Nume platforma: `My Darrin`
- Domeniu final: `www.mydarrin.com`
- Subdomeniu temporar: `mydarrin.homebestpal.com`
- Slogan de suport: `Home Best Pal`

### 2.2 Business identity

- Entitate principala: `Home Best Pal LTD (UK)`
- Adresa UK: `124 City Road, London, England, EC1V 2NX`
- Telefon UK: `+44 7451 268188`
- Filiala Romania: `Home Best Pal Romania`
- CUI Romania: `RO46577229`
- Locatie Romania: `Bucuresti`
- Telefon Romania: `+40 755 511 777`

### 2.3 Official communication channels

- GDPR: `gdpr@homebestpal.com`
- Notificari generale automate: `info@mydarrin.com`
- Suport tehnic: `technical.support@mydarrin.com`
- Suport clienti: `darrin@mydarrin.com`

## 3. Visual system direction

### 3.1 Mandatory palette

Platforma web si aplicatiile mobile vor folosi aceeasi baza de brand.

#### Core platform colors

- Orange primary: `#EF7F1A`
- Blue primary: `#1E2E4D`

#### Darrin AI colors

- AI green primary: `#09A299`
- AI green secondary: `#117A73`

### 3.2 Color usage rules

- `#EF7F1A` se foloseste pentru CTA-uri principale, accente de conversie, highlight-uri comerciale si indicatori de actiune.
- `#1E2E4D` se foloseste pentru header, texte puternice, fundaluri premium, elemente enterprise si componente de incredere.
- `#09A299` si `#117A73` se folosesc exclusiv sau prioritar in zonele cu semnificatie AI: `Darrin AI`, recomandari inteligente, automatizari, insight-uri, asistenti, chat, scoruri si predictii.

### 3.3 Visual inheritance from the old version

Din mostenirea HomeBestPal pastram:

- sentimentul de incredere si servicii pentru casa
- robotul ca simbol de asistenta si automatizare
- directia cromatica portocaliu + albastru

Schimbam si modernizam:

- denumirea in toate materialele: `My Darrin`
- structura home page-ului, pentru a sustine marketplace + AI + parteneri + investitori
- sistemul de design, astfel incat sa fie coerent intre web, backoffice si mobile

## 4. Design principles

- Designul trebuie sa fie premium, clar si usor de inteles pentru clientii B2C, B2B si parteneri.
- `Darrin AI` nu trebuie prezentat ca un element decorativ, ci ca o componenta functionala a produsului.
- Home page-ul trebuie sa comunice simultan 4 directii: servicii, parteneriate, investitii, inteligenta artificiala.
- Toate sectiunile trebuie sa poata fi alimentate ulterior din date reale existente sau create in backoffice.
- Designul trebuie gandit mobile-first, dar cu prezentare premium pe desktop.

## 5. Project phases

## 5.1 Phase 1: Home Page mockup

Scop:

- definirea directiei vizuale finale pentru `My Darrin`
- aprobarea identitatii vizuale si informationale
- validarea structurii home page-ului inainte de implementare

Livrabile:

- mockup desktop `Home Page`
- mockup mobile `Home Page`
- varianta cu sectiuni cheie validate
- text placeholder directionat pe business real
- biblioteca de componente initiale pentru homepage

Rezultat asteptat:

- semnare / aprobare de business pentru a intra in implementare

## 5.2 Phase 2: Frontend implementation

Scop:

- transformarea mockup-ului aprobat intr-un homepage functional in proiectul curent
- integrarea cu structura existenta Next.js / My Darrin

Livrabile:

- pagina homepage implementata
- componente reutilizabile
- integrare cu navigation, layout, footer, CTA-uri si preview sections

## 5.3 Phase 3: Data synchronization and dynamic content

Scop:

- conectarea homepage-ului si paginilor publice cu date reale din ecosistem

Zone obligatorii de sincronizat:

- `Catalog / Services`
- `Devino Partener`
- `Devino Investitor`
- `Pagina servicii`
- categorii, subcategorii, servicii finale
- assets si continut administrat din backoffice

## 5.4 Phase 4: Full public experience

Scop:

- extinderea designului aprobat catre toate fluxurile deja proiectate

Module tinta:

- catalog public
- service detail
- search si filtre
- onboarding partener
- onboarding investitor
- formular contact
- AI assistant entry points
- cont utilizator / autentificare

## 6. Information architecture for Home Page

Home page-ul din etapa 1 trebuie sa includa urmatoarele blocuri:

1. `Top utility bar`
2. `Main header`
3. `Hero section`
4. `How My Darrin works`
5. `Services preview`
6. `Darrin AI section`
7. `Become our partner`
8. `Become an investor`
9. `Trust, compliance and company data`
10. `Footer`

### 6.1 Top utility bar

Continut recomandat:

- locatie activa / aria de servicii
- selector limba
- contact rapid
- eventual punct de intrare catre business / suport

### 6.2 Main header

Continut minim:

- logo `My Darrin`
- meniu principal
- cautare
- buton CTA principal
- acces cont

Meniu recomandat:

- Servicii
- Cum functioneaza
- Darrin AI
- Devino partener
- Devino investitor
- Despre noi
- Contact

### 6.3 Hero section

Mesaj principal:

- My Darrin uneste servicii pentru casa, executie operationala si inteligenta artificiala intr-o singura platforma

Elemente obligatorii:

- headline puternic
- subheadline clar
- CTA principal
- CTA secundar
- imagine / ilustratie Darrin
- indicii despre servicii si AI

### 6.4 How My Darrin works

Trebuie explicat simplu:

1. alegi serviciul
2. configurezi cererea
3. Darrin AI optimizeaza si recomanda
4. partenerul executa
5. backoffice-ul si platforma sincronizeaza operatiunile

### 6.5 Services preview

Aceasta zona va deveni dinamica dupa implementare.

Trebuie sa poata prelua:

- domenii
- categorii
- servicii promovate
- pachete sau niveluri
- CTA catre catalog complet

### 6.6 Darrin AI section

Aceasta sectiune trebuie sa fie distincta vizual prin accente verzi.

Trebuie sa comunice:

- recomandari inteligente
- automatizare selectie servicii
- asistenta conversationala
- prioritizare operationala
- suport pentru clienti si parteneri

### 6.7 Become our partner

Trebuie sa trimita catre fluxul `Devino partener`, deja gandit in ecosistem.

Mesaje cheie:

- onboarding simplificat
- acces la cereri reale
- validare si crestere in platforma

### 6.8 Become an investor

Trebuie sa trimita catre fluxul `Devino investitor`.

Mesaje cheie:

- acces la oportunitate
- crestere scalabila bazata pe servicii + AI
- transparenta si business governance

### 6.9 Trust and company block

Trebuie sa includa:

- date business UK
- date business Romania
- GDPR
- suport tehnic
- suport clienti
- linkuri legale si de conformitate

## 7. Synchronization rules with the existing platform

Implementarea homepage-ului nu trebuie sa fie izolata. Ea trebuie aliniata la proiectul existent.

### 7.1 Source of truth

Backoffice-ul ramane sursa de adevar pentru:

- structura catalogului
- domenii
- categorii
- subcategorii
- servicii
- activitati, resurse, indicatori si configurari
- assets atasate entitatilor

### 7.2 Frontend synchronization

Homepage-ul si paginile publice trebuie sa consume datele gestionate in backoffice prin API-urile deja existente sau extinse.

Principiu:

- ce se creeaza sau se populeaza in `servicii` trebuie sa poata aparea controlat in homepage, catalog si paginile de conversie

### 7.3 Modules that must stay aligned

- `Catalog / Services`
- `Become Partner`
- `Become Investor`
- `Backoffice service management`
- `Homepage promoted sections`
- `Public service pages`

### 7.4 Content governance

Este recomandata introducerea urmatoarelor campuri de prezentare pentru entitatile publice:

- `is_featured_on_homepage`
- `homepage_sort_order`
- `homepage_badge`
- `hero_media`
- `short_marketing_copy`
- `public_visibility_status`

## 8. Technical development structure

Se recomanda urmatoarea structura de lucru pentru design si implementare:

```text
docs/
  design/
    MYDARRIN-DESIGN-DEVELOPMENT-PLAN.md
    mydarrin-homepage-mockup/
      README.md
      QA-CHECKLIST.md

backoffice/
  app/
    homepage-preview/

frontend/
  public/
    brand/
    darrin-ai/
    homepage/
```

## 9. Development workflow

### 9.1 Step A: Discovery and consolidation

- colectare referinte vizuale vechi
- confirmare logo principal final
- confirmare sistem cromatic
- confirmare ton de brand
- inventar de sectiuni obligatorii pentru homepage

### 9.2 Step B: Wireframe

- homepage wireframe desktop
- homepage wireframe mobile
- definire ierarhie informatie

### 9.3 Step C: High-fidelity mockup

- compozitie vizuala finala
- ilustratii / asset placement
- CTA-uri finale
- varianta de aprobare business

### 9.4 Step D: Frontend implementation

- implementare componente
- implementare layout
- implementare responsive
- conectare la date mock sau reale

### 9.5 Step E: Integration

- integrare cu API
- sincronizare cu catalog si backoffice
- validare legaturi navigation / CTA

### 9.6 Step F: QA and acceptance

- test functional
- test responsive
- test continut
- test accesibilitate
- aprobare finala

## 10. Testing strategy

## 10.1 Design review testing

Inainte de implementare se valideaza:

- noul branding `My Darrin`
- utilizarea corecta a sloganului `Home Best Pal`
- separarea clara intre identitatea platformei si identitatea business-ului
- coerenta culorilor platforma vs AI
- ierarhia CTA-urilor

## 10.2 Functional testing after implementation

Se valideaza:

- incarcare homepage
- routing corect
- functionare CTA-uri
- functionare carduri catre servicii
- functionare intrari catre `Devino partener`
- functionare intrari catre `Devino investitor`
- afisare date dinamice din backoffice

## 10.3 Responsive testing

Breakpoints minime:

- mobile
- tablet
- desktop
- large desktop

## 10.4 Content testing

Se valideaza:

- logo corect
- denumire platforma corecta
- domenii corecte
- email-uri corecte
- date companie corecte
- texte legale si suport corecte

## 10.5 Accessibility testing

Se valideaza:

- contrast text / fundal
- focus states
- keyboard navigation
- semantica heading-urilor
- descrieri pentru imagini relevante

## 11. Acceptance criteria for Phase 1 mockup

Mockup-ul homepage este considerat aprobat doar daca:

- foloseste denumirea `My Darrin`
- pastreaza `Home Best Pal` ca slogan, nu ca nume principal al platformei
- comunica clar componenta `Darrin AI`
- respecta paleta portocaliu + albastru pentru platforma
- foloseste verdele doar pentru AI si automatizari
- include toate entry point-urile majore din ecosistem
- poate fi transformat fara blocaje in implementare tehnica

## 12. Risks and controls

### Risk 1

Confuzie intre `HomeBestPal`, `Home Best Pal` si `My Darrin`.

Control:

- ghid clar de naming in toate ecranele si textele

### Risk 2

Homepage frumos vizual, dar rupt de datele reale din sistem.

Control:

- toate sectiunile publice trebuie gandite din start pentru populare din backoffice

### Risk 3

AI tratat doar decorativ.

Control:

- fiecare zona `Darrin AI` trebuie sa aiba valoare de produs si mesaj functional

### Risk 4

Incoerenta intre web si mobile.

Control:

- acelasi sistem de culori, componente si tone of voice

## 13. Final recommendation

Se recomanda urmatoarea ordine de executie:

1. aprobare logo final `My Darrin`
2. aprobare directie cromatica si rolul culorilor AI
3. realizare `Home Page mockup`
4. validare business
5. implementare homepage in proiect
6. conectare cu catalog si backoffice
7. extindere design catre restul fluxurilor

Acest document este baza de lucru pentru etapa de design si implementare public-facing a platformei `My Darrin`.
