# Backoffice Resource Import Schema

## Scop
Schema de mai jos standardizeaza importul de rate-card si documentatie tehnica in Backoffice pentru ACA BUSINESS GROUP.

## Model Operational
Exista doua straturi:

1. `catalog_resources`
- tine resursa comerciala si tehnica
- tipuri suportate: `MATERIAL`, `EQUIPMENT`, `TRANSPORT`, `LABOR`

2. `entity_attachments`
- tine PDF-uri, imagini si video asociate resursei
- `entity_type = resource`

## Campuri Recomandate Pentru Resource Master Data

| Camp | Tip | Obligatoriu | Exemplu |
|---|---|---:|---|
| `name_ro` | string | da | `Rigips RF 12.5 mm` |
| `name_en` | string | da | `Rigips RF 12.5 mm` |
| `resource_type` | enum | da | `MATERIAL` |
| `base_price` | number | da | `0` |
| `unit` | string | da | `buc` |
| `esco_code` | string | nu | `` |
| `lead_time_days` | number | nu | `1` |
| `stock_qty` | number | nu | `1` |
| `availability_status` | string | nu | `IN_STOCK` |
| `technical_specs` | json | da | vezi exemplu |
| `is_active` | boolean | da | `true` |

## Exemplu `technical_specs`

```json
{
  "commercial_supplier": "ACA BUSINESS GROUP",
  "supplier_cui": "32667674",
  "warehouse_origin": "Bacau, Str. Calea Moinesti nr. 24",
  "original_brand": "Rigips",
  "main_specification": "Placa gips-carton RF 12.5 mm",
  "secondary_specs": {
    "sheet_size": "1200 x 2600 mm",
    "usage": "rezistenta la foc"
  },
  "rate_card_currency": ["RON", "EUR"],
  "source_document": "Rigips 1.pdf"
}
```

## Import Documentatie Tehnica
Pentru fiecare PDF se creeaza un attachment:

| Camp | Valoare |
|---|---|
| `entity_type` | `resource` |
| `entity_id` | id-ul resursei |
| `attachment_type` | `DOCUMENT` |
| `file_name` | numele PDF-ului |
| `mime_type` | `application/pdf` |

## Mapping Comercial Recomandat

| Categorie ERP | `resource_type` | Exemple |
|---|---|---|
| Materiale de Constructii si Chimice | `MATERIAL` | Rigips, Sika, mortare |
| Echipamente si Scule Industriale | `EQUIPMENT` | taietor beton, placa compactoare, masina canelat |
| Utilaje Grele si Compacte | `EQUIPMENT` | excavator, buldoexcavator, mini-excavator |
| Flota / Livrare / Logistica | `TRANSPORT` | autobetoniera, van comercial |

## Structura de Import Recomandata
1. creezi sau actualizezi resursa in `catalog_resources`
2. completezi `technical_specs` cu identitatea ACA BUSINESS GROUP
3. incarci PDF-ul in `entity_attachments`
4. optional completezi preturile locale in `admin_resource_price_configs`

## Schema CSV Pentru Import Comercial

| Coloana CSV | Mapping Backoffice |
|---|---|
| `furnizor_comercial` | `technical_specs.commercial_supplier` |
| `cui_furnizor` | `technical_specs.supplier_cui` |
| `depozit_referinta` | `technical_specs.warehouse_origin` |
| `producator_original` | `technical_specs.original_brand` |
| `nume_model` | `name_ro`, `name_en` |
| `categorie` | `technical_specs.category_label` |
| `subcategorie` | `technical_specs.subcategory_label` |
| `specificatie_principala` | `technical_specs.main_specification` |
| `specificatii_suplimentare` | `technical_specs.secondary_specs` |
| `unitate_masura` | `unit` |
| `pret_unitar_ron` | `base_price` sau `admin_resource_price_configs.base_price` |
| `pret_unitar_eur` | pricing contextual ulterior |
| `lead_time_zile` | `lead_time_days` |
| `observatii_logistice` | `technical_specs.logistics_notes` |
| `sursa_document` | attachment `file_name` |

## Rezultat Dorit in Backoffice
- resursa vizibila in `Backoffice Resources`
- PDF vizibil in `Documentatie resursa`
- entitate comerciala standardizata sub ACA BUSINESS GROUP
- baza pregatita pentru rate-card, proforme si fise logistice
