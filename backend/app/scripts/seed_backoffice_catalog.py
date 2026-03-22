from app.db.session import SessionLocal
from app.schemas.category import CategoryCreate
from app.schemas.domain import DomainCreate
from app.schemas.subcategory import SubcategoryCreate
from app.services.catalog_service import (
    create_category,
    create_domain,
    create_subcategory,
    get_category_by_slug,
    get_domain_by_slug,
    get_subcategory_by_slug,
)


SEED_STRUCTURE = [
    {
        "name_ro": "Constructii, Infrastructura si Imobiliare",
        "name_en": "Construction, Infrastructure and Real Estate",
        "slug": "constructii-infrastructura-imobiliare",
        "caen_codes": ["4120", "4311", "4339", "4391", "4399"],
        "uniclass_codes": ["Ac_v1_25", "EF_v1_16", "SL_v1_34"],
        "esco_codes": ["http://data.europa.eu/esco/occupation/ef2d13f5-3044-48b6-a847-080f2c6e8007"],
        "categories": [
            {
                "name_ro": "Constructii civile si industriale",
                "name_en": "Civil and Industrial Construction",
                "slug": "constructii-civile-industriale",
                "caen_codes": ["4120"],
                "uniclass_codes": ["EF_25_10", "SL_15_70"],
                "esco_codes": ["http://data.europa.eu/esco/skill/4ed385bf-3e87-476a-9f06-08c2e801133a"],
                "subcategories": [
                    {
                        "name_ro": "Executie structuri si fundatii",
                        "name_en": "Structures and Foundations Execution",
                        "slug": "executie-structuri-fundatii",
                        "caen_codes": ["4311", "4399"],
                        "uniclass_codes": ["SL_25_10"],
                        "esco_codes": ["http://data.europa.eu/esco/skill/592525ab-b517-4c55-8c65-17e0f5d99205"],
                    },
                    {
                        "name_ro": "Finisaje interioare si exterioare",
                        "name_en": "Interior and Exterior Finishes",
                        "slug": "finisaje-interioare-exterioare",
                        "caen_codes": ["4339"],
                        "uniclass_codes": ["SL_30_40"],
                        "esco_codes": ["http://data.europa.eu/esco/skill/81f03b64-4f82-4bc4-b67d-894ddc97985b"],
                    },
                ],
            }
        ],
    },
    {
        "name_ro": "Tehnologie, Automatizari si Smart Home",
        "name_en": "Technology, Automation and Smart Home",
        "slug": "tehnologie-automatizari-smart-home",
        "caen_codes": ["4321", "6201"],
        "uniclass_codes": ["TE_v1_18", "EF_v1_16"],
        "esco_codes": ["http://data.europa.eu/esco/occupation/0ff4d24c-eb91-4794-ab18-9f05739dda40"],
        "categories": [
            {
                "name_ro": "Automatizari rezidentiale",
                "name_en": "Residential Automation",
                "slug": "automatizari-rezidentiale",
                "caen_codes": ["4321"],
                "uniclass_codes": ["TE_70_80"],
                "esco_codes": ["http://data.europa.eu/esco/skill/2492becf-6769-4431-8e95-bee41b36232a"],
                "subcategories": [
                    {
                        "name_ro": "Sisteme smart home",
                        "name_en": "Smart Home Systems",
                        "slug": "sisteme-smart-home",
                        "caen_codes": ["4321"],
                        "uniclass_codes": ["TE_70_80_85"],
                        "esco_codes": ["http://data.europa.eu/esco/skill/74fc4291-203e-4082-9f22-8499f584861c"],
                    }
                ],
            }
        ],
    },
    {
        "name_ro": "Energie Verde si Sustenabilitate",
        "name_en": "Green Energy and Sustainability",
        "slug": "energie-verde-sustenabilitate",
        "caen_codes": ["3511", "4321"],
        "uniclass_codes": ["EF_v1_16", "SL_v1_34"],
        "esco_codes": ["http://data.europa.eu/esco/occupation/f879a418-3e81-4216-9533-aaedce55fa97"],
        "categories": [
            {
                "name_ro": "Sisteme fotovoltaice",
                "name_en": "Photovoltaic Systems",
                "slug": "sisteme-fotovoltaice",
                "caen_codes": ["3511", "4321"],
                "uniclass_codes": ["EF_70_20"],
                "esco_codes": ["http://data.europa.eu/esco/skill/6d53015b-6867-408f-8f3a-4eb9d5dae101"],
                "subcategories": [
                    {
                        "name_ro": "Montaj panouri si invertoare",
                        "name_en": "Panels and Inverters Installation",
                        "slug": "montaj-panouri-invertoare",
                        "caen_codes": ["4321"],
                        "uniclass_codes": ["SL_35_10"],
                        "esco_codes": ["http://data.europa.eu/esco/skill/0ff4d24c-eb91-4794-ab18-9f05739dda40"],
                    }
                ],
            }
        ],
    },
    {
        "name_ro": "Transport, Logistica si Mobilitate",
        "name_en": "Transport, Logistics and Mobility",
        "slug": "transport-logistica-mobilitate",
        "caen_codes": ["4941", "4939", "5229"],
        "uniclass_codes": ["Ac_v1_25", "SL_v1_34"],
        "esco_codes": ["http://data.europa.eu/esco/occupation/263782c1-c65d-458a-ae67-8526ccf214f5"],
        "categories": [
            {
                "name_ro": "Transport marfa",
                "name_en": "Freight Transport",
                "slug": "transport-marfa",
                "caen_codes": ["4941", "5229"],
                "uniclass_codes": ["Ac_15_10"],
                "esco_codes": ["http://data.europa.eu/esco/skill/415f816c-07ae-4ac1-9ddb-ecaa9957a249"],
                "subcategories": [
                    {
                        "name_ro": "Logistica last mile",
                        "name_en": "Last Mile Logistics",
                        "slug": "logistica-last-mile",
                        "caen_codes": ["5229"],
                        "uniclass_codes": ["Ac_15_10_46"],
                        "esco_codes": ["http://data.europa.eu/esco/skill/0332f526-6dc0-4f09-8a7c-2b9473c50736"],
                    }
                ],
            }
        ],
    },
    {
        "name_ro": "Reparatii Auto, Camioane si Utilaje Industriale",
        "name_en": "Auto, Truck and Industrial Equipment Repairs",
        "slug": "reparatii-auto-camioane-utilaje-industriale",
        "caen_codes": ["4520", "3312"],
        "uniclass_codes": ["Ma_v1_1", "TE_v1_18"],
        "esco_codes": ["http://data.europa.eu/esco/occupation/a703b581-ad64-4791-8bb3-624aea569fa5"],
        "categories": [
            {
                "name_ro": "Service auto si flote",
                "name_en": "Auto Service and Fleets",
                "slug": "service-auto-flote",
                "caen_codes": ["4520"],
                "uniclass_codes": ["Ma_15_10"],
                "esco_codes": ["http://data.europa.eu/esco/skill/509fedda-d520-46b5-a801-b3d36221a645"],
                "subcategories": [
                    {
                        "name_ro": "Diagnoza si mentenanta utilaje",
                        "name_en": "Equipment Diagnostics and Maintenance",
                        "slug": "diagnoza-mentenanta-utilaje",
                        "caen_codes": ["3312"],
                        "uniclass_codes": ["Ma_15_10_25"],
                        "esco_codes": ["http://data.europa.eu/esco/skill/0b4d52be-fb79-4a6c-8177-799f1214aae5"],
                    }
                ],
            }
        ],
    },
]


def main() -> None:
    db = SessionLocal()
    try:
        for domain_data in SEED_STRUCTURE:
            domain = get_domain_by_slug(db, domain_data["slug"])
            if not domain:
                domain = create_domain(db, DomainCreate(**{k: domain_data[k] for k in ("name_ro", "name_en", "slug", "caen_codes", "uniclass_codes", "esco_codes")}))

            for category_data in domain_data["categories"]:
                category = get_category_by_slug(db, category_data["slug"])
                if not category:
                    category = create_category(
                        db,
                        CategoryCreate(
                            domain_id=domain.id,
                            name_ro=category_data["name_ro"],
                            name_en=category_data["name_en"],
                            slug=category_data["slug"],
                            caen_codes=category_data["caen_codes"],
                            uniclass_codes=category_data["uniclass_codes"],
                            esco_codes=category_data["esco_codes"],
                        ),
                    )

                for subcategory_data in category_data["subcategories"]:
                    if get_subcategory_by_slug(db, subcategory_data["slug"]):
                        continue
                    create_subcategory(
                        db,
                        SubcategoryCreate(
                            category_id=category.id,
                            name_ro=subcategory_data["name_ro"],
                            name_en=subcategory_data["name_en"],
                            slug=subcategory_data["slug"],
                            caen_codes=subcategory_data["caen_codes"],
                            uniclass_codes=subcategory_data["uniclass_codes"],
                            esco_codes=subcategory_data["esco_codes"],
                        ),
                    )
    finally:
        db.close()


if __name__ == "__main__":
    main()
