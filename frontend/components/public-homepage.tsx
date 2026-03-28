import type { ReactNode } from "react";

import type { HomepageContent } from "@/lib/site-content";

type Props = {
  page: HomepageContent;
};

function Marker({ children }: { children: ReactNode }) {
  return <span className="marker">{children}</span>;
}

export function PublicHomepage({ page }: Props) {
  const content = page.content;
  const theme = content.meta?.theme;

  return (
    <main className="site-shell">
      <header className="topbar">
        <div>
          <div className="brand-kicker">{content.meta?.subBrand}</div>
          <div className="brand-line">
            <span className="brand-mark">HBP</span>
            <div>
              <h1>{content.meta?.brand}</h1>
              <p>{content.meta?.domain}</p>
            </div>
          </div>
        </div>
        <div className="header-tools">
          <span className="location-pill">{content.header?.locationLabel}</span>
          <span className="language-pill">{content.header?.language}</span>
        </div>
      </header>

      <section className="hero-panel">
        <div className="hero-copy">
          <div className="marker-row">
            <Marker>[LOGO MY DARRIN]</Marker>
            <Marker>[DARRIN AI]</Marker>
            <Marker>[{content.hero?.mediaType ?? "VIDEO"}]</Marker>
          </div>
          <h2>{content.hero?.headline}</h2>
          <p>{content.hero?.subheadline}</p>
          <div className="search-shell">{content.header?.searchPlaceholder}</div>
          <div className="cta-row">
            <button className="cta-primary" style={{ backgroundColor: theme?.cta }}>
              {content.hero?.primaryCta}
            </button>
            <button className="cta-secondary" style={{ backgroundColor: theme?.ai }}>
              {content.hero?.secondaryCta}
            </button>
          </div>
        </div>
        <div className="hero-media" style={{ backgroundColor: theme?.structure }}>
          <div className="hero-media-card">
            <span className="eyebrow">Media configurata din Homepage Builder</span>
            <strong>[{content.hero?.mediaType ?? "VIDEO"}] Hero media</strong>
            <p>Conectat la endpoint-ul public de continut. Dupa Save in Backoffice, front-end-ul poate randa instant modificarile.</p>
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="section-head">
          <span className="eyebrow">Categorii rapide</span>
          <h3>Structura publica sincronizata cu administrarea din Backoffice</h3>
        </div>
        <div className="category-grid">
          {(content.quickCategories ?? []).map((category) => (
            <article key={category.title} className="mini-card">
              <Marker>[ICON]</Marker>
              <strong>{category.title}</strong>
              <span>[{category.media ?? "IMAGINE"}]</span>
            </article>
          ))}
        </div>
      </section>

      <section className="split-grid">
        <article className="section-card">
          <span className="eyebrow">Dual entry</span>
          <h3>{content.dualEntry?.aiCardTitle}</h3>
          <p>Intrare conversationala asistata de Darrin AI pentru text, imagini si video.</p>
        </article>
        <article className="section-card">
          <span className="eyebrow">Catalog entry</span>
          <h3>{content.dualEntry?.catalogCardTitle}</h3>
          <p>Intrare directa in catalog si in pagina individuala a serviciului.</p>
        </article>
      </section>

      <section className="section-card">
        <div className="section-head">
          <span className="eyebrow">Servicii featured</span>
          <h3>Exemplu concret sincronizat: Reparat calorifer</h3>
        </div>
        <div className="service-grid">
          {(content.featuredServices ?? []).map((service) => (
            <article key={service.slug} className={`service-card ${service.featured ? "service-card-featured" : ""}`}>
              <div className="service-media">[IMAGINE]</div>
              <strong>{service.title}</strong>
              <span>{service.rating}</span>
              <p>{service.startingPrice}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="split-grid">
        <article className="section-card">
          <span className="eyebrow">How it works</span>
          <ul className="bullet-list">
            {(content.howItWorks ?? []).map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </article>
        <article className="section-card">
          <span className="eyebrow">Beneficii</span>
          <ul className="bullet-list">
            {(content.benefits ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="section-card">
        <div className="section-head">
          <span className="eyebrow">Sync logic</span>
          <h3>Fluxul Backoffice - Public este pregatit pentru productie</h3>
        </div>
        <ol className="flow-list">
          {(content.syncFlow ?? []).map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="final-cta" style={{ backgroundColor: theme?.structure }}>
        <div>
          <span className="eyebrow eyebrow-light">CTA final</span>
          <h3>Pregatit pentru deploy pe {content.meta?.domain}</h3>
          <p>Configuratia permite publicare pe subdomeniul protejat acum si pe domeniul public final la go-live.</p>
        </div>
        <div className="cta-row">
          <button className="cta-primary" style={{ backgroundColor: theme?.cta }}>
            {content.finalCta?.primary}
          </button>
          <button className="cta-secondary" style={{ backgroundColor: theme?.ai }}>
            {content.finalCta?.secondary}
          </button>
        </div>
      </section>
    </main>
  );
}
