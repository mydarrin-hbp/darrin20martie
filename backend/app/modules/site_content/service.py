from __future__ import annotations

from copy import deepcopy
from typing import Any

from sqlalchemy.orm import Session

from app.modules.site_content.models import SiteContentPage
from app.modules.site_content.schemas import PublicServiceTaxonomyResponse, SiteContentPageUpdate
from app.modules.sync.service import publish_site_content_change
from app.services.catalog_service import get_service_by_slug
from app.services.price_analysis_service import get_service_recipe_activities


def _base_site_content() -> dict[str, Any]:
    return {
        "meta": {
            "brand": "My Darrin",
            "subBrand": "Home Best Pal",
            "domain": "mydarrin.homebestpal.com",
            "goLiveDomain": "www.mydarrin.com",
            "theme": {
                "cta": "#EF7F1A",
                "structure": "#1E2E4D",
                "ai": "#09A299",
                "aiHover": "#117A73",
                "background": "#FFFFFF",
                "surface": "#F5F6F7",
            },
        },
        "branding": {
            "logoText": "My Darrin",
            "logoSubtext": "Home Best Pal",
            "slogan": "Servicii la cerere, fara frictiune",
            "logoUrl": "",
            "faviconUrl": "",
        },
        "design": {
            "fonts": {
                "display": "Inter",
                "body": "Inter",
                "accent": "Inter",
            },
            "fontSizes": {
                "hero": "64px",
                "sectionTitle": "44px",
                "body": "16px",
                "label": "14px",
            },
            "colors": {
                "primary": "#1E2E4D",
                "secondary": "#09A299",
                "accent": "#EF7F1A",
                "background": "#FFFFFF",
                "surface": "#F5F6F7",
                "text": "#1E2E4D",
            },
        },
        "mediaLibrary": {
            "heroVideoUrl": "",
            "heroImageUrl": "",
            "bannerUrls": [],
            "logoVariants": [],
        },
        "header": {
            "locationLabel": "Bucuresti, Sector 3",
            "searchPlaceholder": "Descrie ce ai nevoie... (poti incarca poze/video)",
            "menu": ["Servicii", "Industrii", "Devino Partener", "Devino Investitor", "Contact"],
            "language": "RO",
        },
        "footer": {
            "columns": {
                "servicii": ["Catalog", "Pagina serviciu", "Comenzi rapide"],
                "companie": ["Despre", "Contact", "Investitori"],
                "legal": ["Termeni", "GDPR", "Politici"],
            },
            "apps": ["iOS", "Android"],
        },
        "sync": {
            "source": "backoffice.site_content",
            "managedBy": "SUPER_ADMIN",
            "editableAssets": [
                "text",
                "image",
                "logo",
                "slogan",
                "banner",
                "video",
                "font_family",
                "font_size",
                "color",
            ],
        },
    }


PAGE_DEFAULTS: dict[str, dict[str, Any]] = {
    "homepage": {
        "title": "Homepage Publica My Darrin",
        "notes": "Pagina publica principala sincronizata cu Homepage Builder din Backoffice.",
        "content": {
            "hero": {
                "headline": "Servicii la cerere. Oriunde. Oricand.",
                "subheadline": "AI + Profesionisti verificati pentru orice nevoie - acasa, birou sau industrie.",
                "primaryCta": "Vezi servicii",
                "secondaryCta": "Vorbeste cu Darrin",
                "mediaType": "VIDEO",
            },
            "quickCategories": [
                {"title": "Acasa", "media": "IMAGINE"},
                {"title": "Auto", "media": "IMAGINE"},
                {"title": "Industrial", "media": "IMAGINE"},
                {"title": "HoReCa", "media": "IMAGINE"},
                {"title": "Agricultura", "media": "IMAGINE"},
                {"title": "Logistica", "media": "IMAGINE"},
                {"title": "Institutii", "media": "IMAGINE"},
            ],
            "dualEntry": {
                "aiCardTitle": "Spune problema",
                "catalogCardTitle": "Alege serviciu",
            },
            "featuredServices": [
                {
                    "slug": "reparat-calorifer",
                    "title": "Reparat calorifer",
                    "rating": "4.9",
                    "startingPrice": "de la 189 lei",
                    "featured": True,
                    "syncSource": "backoffice.services",
                },
                {
                    "slug": "montaj-aer-conditionat",
                    "title": "Montaj aer conditionat",
                    "rating": "4.8",
                    "startingPrice": "de la 449 lei",
                    "featured": False,
                    "syncSource": "backoffice.services",
                },
            ],
            "howItWorks": [
                "Descrii / Alegi",
                "Primesti deviz",
                "Alegi furnizor",
                "Executie",
                "Plata securizata + garantie",
            ],
            "benefits": [
                "Pret standardizat",
                "Garantie",
                "Asigurare",
                "Profesionisti verificati",
            ],
            "finalCta": {
                "primary": "Incepe acum",
                "secondary": "Devino partener",
            },
            "syncFlow": [
                "Super Admin configureaza serviciul in Backoffice",
                "Imagini, video si documente sunt salvate",
                "Serviciul devine vizibil automat pe homepage, catalog si pagina serviciului",
                "Super Admin verifica si aproba versiunea publica",
            ],
        },
    },
    "account": {
        "title": "Cont si Darrin AI",
        "notes": "Pagina de intrare pentru cont client si AI.",
        "content": {
            "hero": {
                "headline": "Cont client si intrare conversationala",
                "subheadline": "Utilizatorul poate descrie problema, intra in cont sau continua direct in creare cont.",
                "primaryCta": "Creeaza cont client",
                "secondaryCta": "Explora catalog",
            },
            "benefits": [
                "Descriere problema cu text, imagine si video",
                "Deviz rapid si traseu clar",
                "Continuare directa in checkout",
                "Istoric si statusuri intr-un singur loc",
            ],
        },
    },
    "account-create": {
        "title": "Creare cont - pasul initial",
        "notes": "Pasul 1 din onboarding: date minime si validare telefon.",
        "content": {
            "hero": {
                "headline": "O pagina curata si clara pentru primul pas",
                "subheadline": "Salvam doar datele minime si continuam pe rol dupa validarea telefonului.",
                "primaryCta": "Salveaza si trimite cod SMS",
                "secondaryCta": "Cont administrare",
            },
            "signupFlow": {
                "step": 1,
                "roleOptions": ["CLIENT", "PARTNER", "INVESTITOR"],
                "adminSeparate": True,
            },
        },
    },
    "account-create-select-role": {
        "title": "Creare cont - selectie rol",
        "notes": "Pasul 2: selectia rolului dupa validarea telefonului.",
        "content": {
            "hero": {
                "headline": "Alegi traseul potrivit dupa validarea telefonului",
                "subheadline": "Fiecare rol merge pe pagina lui, cu campuri si reguli dedicate.",
            },
            "signupFlow": {"step": 2},
        },
    },
    "account-create-client": {
        "title": "Creare cont client",
        "notes": "Pasul final pentru cont client.",
        "content": {
            "hero": {
                "headline": "Finalizeaza contul de client",
                "subheadline": "Clientul isi poate activa imediat contul si continua in catalog si checkout.",
            },
            "signupFlow": {"step": 3, "role": "CLIENT"},
        },
    },
    "partners-join": {
        "title": "Devino partener",
        "notes": "Landing public pentru parteneri.",
        "content": {
            "hero": {
                "headline": "Zona partenerilor foloseste acelasi sistem public V3",
                "subheadline": "Formular, beneficii si aprobari sincronizate cu backoffice.",
                "primaryCta": "Creeaza cont partener",
                "secondaryCta": "Vezi servicii",
            },
        },
    },
    "partners-join-create": {
        "title": "Creare cont partener",
        "notes": "Pasul final pentru cont partener.",
        "content": {
            "hero": {
                "headline": "Finalizeaza contul de partener",
                "subheadline": "Partenerul intra in validare operationala dupa finalizarea parolei.",
            },
            "signupFlow": {"step": 3, "role": "PARTNER"},
        },
    },
    "investors": {
        "title": "Devino investitor",
        "notes": "Landing public pentru investitori.",
        "content": {
            "hero": {
                "headline": "Modulul investitori este parte din sistemul public sincronizat",
                "subheadline": "Mesaj, CTA si continut administrabile separat din backoffice.",
                "primaryCta": "Creeaza cont investitor",
                "secondaryCta": "Contact",
            },
        },
    },
    "investors-create": {
        "title": "Creare cont investitor",
        "notes": "Pasul final pentru cont investitor.",
        "content": {
            "hero": {
                "headline": "Finalizeaza contul de investitor",
                "subheadline": "Contul intra in fluxul intern de evaluare administrativa.",
            },
            "signupFlow": {"step": 3, "role": "INVESTOR"},
        },
    },
    "account-create-administrare": {
        "title": "Acces administrare",
        "notes": "Pagina publica pentru explicarea accesului separat in backoffice.",
        "content": {
            "hero": {
                "headline": "Conturile de administrare sunt separate de fluxul public",
                "subheadline": "Admin si Super Admin se aproba intern si intra prin subdomeniul dedicat.",
                "primaryCta": "Deschide Backoffice",
                "secondaryCta": "Inapoi la creare cont",
            },
            "adminFlow": {
                "approvalOwner": "SUPER_ADMIN",
                "entryUrl": "https://admin.mydarrin.homebestpal.com",
            },
        },
    },
    "catalog": {
        "title": "Catalog servicii",
        "notes": "Catalogul public sincronizat din serviciile active din backoffice.",
        "content": {
            "hero": {
                "headline": "Catalogul public este sincronizat cu serviciile din backoffice",
                "subheadline": "Selectia serviciilor, nivelurilor si preturilor pleaca din administrarea centrala.",
                "primaryCta": "Alege serviciu",
                "secondaryCta": "Mergi in cos",
            },
            "catalogFlow": {
                "supportsLevels": True,
                "supportsCart": True,
                "syncSource": "catalog.services",
            },
        },
    },
    "cart": {
        "title": "Cos",
        "notes": "Pagina cos public.",
        "content": {
            "hero": {
                "headline": "Cosul public ramane sincronizat cu serviciile selectate",
                "subheadline": "Utilizatorul vede serviciul, nivelul selectat si sumarul clar.",
                "primaryCta": "Continua spre checkout",
            }
        },
    },
    "checkout": {
        "title": "Checkout",
        "notes": "Pagina de checkout public.",
        "content": {
            "hero": {
                "headline": "Checkout-ul foloseste aceeasi structura aprobata",
                "subheadline": "Datele comenzii, sumarul si plata raman aliniate la acelasi sistem.",
                "primaryCta": "Continua la plata",
            }
        },
    },
    "payment-status": {
        "title": "Status plata",
        "notes": "Confirmare si urmarire status plata.",
        "content": {
            "hero": {
                "headline": "Statusul platii este sincronizat cu comanda si executia",
                "subheadline": "Confirmarile raman clare si vizibile in zona publica si in backoffice.",
            }
        },
    },
    "service-detail": {
        "title": "Pagina serviciu",
        "notes": "Pagina serviciu publica, alimentata de serviciile active.",
        "content": {
            "hero": {
                "headline": "Pagina serviciului este alimentata din backoffice",
                "subheadline": "Media, descrierea, nivelurile si CTA-urile vin din administrarea serviciului.",
            }
        },
    },
}


def _deep_merge(base: dict[str, Any], override: dict[str, Any]) -> dict[str, Any]:
    merged = deepcopy(base)
    for key, value in override.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = _deep_merge(merged[key], value)
        else:
            merged[key] = deepcopy(value)
    return merged


def _build_default_page(slug: str) -> dict[str, Any]:
    base = _base_site_content()
    seed = PAGE_DEFAULTS.get(
        slug,
        {
            "title": slug.replace("-", " ").title(),
            "notes": "Pagina configurabila din Backoffice.",
            "content": {
                "hero": {
                    "headline": slug.replace("-", " ").title(),
                    "subheadline": "Continut configurabil si sincronizat din Backoffice.",
                }
            },
        },
    )
    return {
        "title": seed["title"],
        "notes": seed["notes"],
        "content": _deep_merge(base, seed.get("content", {})),
    }


def list_pages(db: Session) -> list[SiteContentPage]:
    pages = db.query(SiteContentPage).order_by(SiteContentPage.slug.asc()).all()
    existing_slugs = {page.slug for page in pages}
    for slug in PAGE_DEFAULTS:
        if slug not in existing_slugs:
            pages.append(get_or_create_page(db, slug))
    return sorted(pages, key=lambda page: page.slug)


def get_or_create_page(db: Session, slug: str) -> SiteContentPage:
    page = db.query(SiteContentPage).filter(SiteContentPage.slug == slug).first()
    if page:
        return page

    seed = _build_default_page(slug)
    page = SiteContentPage(
        slug=slug,
        title=seed["title"],
        status="published",
        content=seed["content"],
        notes=seed["notes"],
    )
    db.add(page)
    db.commit()
    db.refresh(page)
    return page


def update_page(db: Session, slug: str, payload: SiteContentPageUpdate) -> SiteContentPage:
    page = get_or_create_page(db, slug)
    page.title = payload.title
    page.status = payload.status
    page.content = payload.content
    page.notes = payload.notes
    db.add(page)
    db.commit()
    db.refresh(page)
    publish_site_content_change(page)
    return page


def get_public_service_taxonomy(db: Session, slug: str) -> PublicServiceTaxonomyResponse | None:
    service = get_service_by_slug(db, slug)
    if not service:
        return None

    domain_name = None
    category_name = None
    subcategory_names: list[str] = []
    caen_codes: list[str] = []
    uniclass_codes: list[str] = []
    esco_codes: list[str] = []

    def _extend_unique(target: list[str], values: list[str] | None) -> None:
        seen = set(target)
        for value in values or []:
            item = str(value).strip()
            if not item or item in seen:
                continue
            seen.add(item)
            target.append(item)

    for subcategory in service.subcategories:
        if not domain_name and getattr(subcategory.category, "domain", None):
            domain_name = subcategory.category.domain.name_ro
        if not category_name and getattr(subcategory, "category", None):
            category_name = subcategory.category.name_ro
        subcategory_names.append(subcategory.name_ro)
        _extend_unique(caen_codes, getattr(subcategory.category.domain, "caen_codes", []) if getattr(subcategory.category, "domain", None) else [])
        _extend_unique(caen_codes, getattr(subcategory.category, "caen_codes", []))
        _extend_unique(caen_codes, getattr(subcategory, "caen_codes", []))
        _extend_unique(uniclass_codes, getattr(subcategory.category.domain, "uniclass_codes", []) if getattr(subcategory.category, "domain", None) else [])
        _extend_unique(uniclass_codes, getattr(subcategory.category, "uniclass_codes", []))
        _extend_unique(uniclass_codes, getattr(subcategory, "uniclass_codes", []))
        _extend_unique(esco_codes, getattr(subcategory.category.domain, "esco_codes", []) if getattr(subcategory.category, "domain", None) else [])
        _extend_unique(esco_codes, getattr(subcategory.category, "esco_codes", []))
        _extend_unique(esco_codes, getattr(subcategory, "esco_codes", []))

    indicator_codes: list[str] = []
    for activity in get_service_recipe_activities(db, service.id):
        code = str(getattr(activity, "uniclass_code", "")).strip()
        if code and code not in indicator_codes:
            indicator_codes.append(code)

    return PublicServiceTaxonomyResponse(
        slug=service.slug,
        service_name=service.name,
        domain=domain_name,
        category=category_name,
        subcategories=list(dict.fromkeys(subcategory_names)),
        caen_codes=caen_codes,
        uniclass_codes=uniclass_codes,
        esco_codes=esco_codes,
        indicator_codes=indicator_codes,
    )
