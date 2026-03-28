import Link from "next/link";

import { ModuleHeader } from "@/components/module-header";

type Metric = {
  label: string;
  value: string;
  hint: string;
};

type LinkCard = {
  title: string;
  description: string;
  href: string;
  cta: string;
};

type StatusItem = {
  label: string;
  value: string;
};

export function AdminHub({
  title,
  description,
  badge,
  metrics,
  quickLinks,
  statusItems,
  focus,
}: {
  title: string;
  description: string;
  badge: string;
  metrics: Metric[];
  quickLinks: LinkCard[];
  statusItems: StatusItem[];
  focus: string[];
}) {
  return (
    <div>
      <ModuleHeader title={title} description={description} badge={badge} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="panel p-5">
            <div className="text-sm text-muted">{metric.label}</div>
            <div className="mt-3 text-3xl font-semibold text-ink">{metric.value}</div>
            <div className="mt-2 text-sm text-muted">{metric.hint}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="panel p-6">
          <h3 className="text-xl font-semibold text-ink">Zone actionabile</h3>
          <div className="mt-4 grid gap-4">
            {quickLinks.map((link) => (
              <article key={link.href} className="rounded-3xl border border-border bg-white/75 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <div className="text-lg font-semibold text-ink">{link.title}</div>
                    <p className="mt-2 text-sm leading-6 text-muted">{link.description}</p>
                  </div>
                  <Link href={link.href} className="btn-secondary">
                    {link.cta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6">
          <div className="panel p-6">
            <h3 className="text-xl font-semibold text-ink">Status curent</h3>
            <div className="mt-4 grid gap-3">
              {statusItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border bg-white/75 px-4 py-3">
                  <span className="text-sm text-ink">{item.label}</span>
                  <span className="tag">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-6">
            <h3 className="text-xl font-semibold text-ink">Focus V5.2</h3>
            <div className="mt-4 grid gap-3 text-sm text-muted">
              {focus.map((item) => (
                <div key={item} className="rounded-2xl border border-border bg-white/75 px-4 py-3">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
