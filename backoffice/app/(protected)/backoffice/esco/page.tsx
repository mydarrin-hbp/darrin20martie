"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth-provider";
import { ModuleHeader } from "@/components/module-header";
import {
  EscoIscoGroupRecord,
  EscoOccupationRecord,
  EscoSkillRecord,
  getEscoIscoGroups,
  getEscoOccupations,
  getEscoSkills,
} from "@/lib/api";

type EscoTab = "isco-groups" | "skills" | "occupations";

const tabLabels: Record<EscoTab, string> = {
  "isco-groups": "ISCO groups",
  skills: "Skills",
  occupations: "Occupations",
};

function summarizeTerms(values: string[], limit = 4) {
  if (!values.length) {
    return "Fara termeni alternativi";
  }
  return values.slice(0, limit).join(", ");
}

export default function EscoBrowserPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<EscoTab>("isco-groups");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [iscoGroups, setIscoGroups] = useState<EscoIscoGroupRecord[]>([]);
  const [skills, setSkills] = useState<EscoSkillRecord[]>([]);
  const [occupations, setOccupations] = useState<EscoOccupationRecord[]>([]);

  async function load(tab: EscoTab, searchValue: string) {
    if (!token) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (tab === "isco-groups") {
        const response = await getEscoIscoGroups(token, { q: searchValue, limit: 60 });
        setIscoGroups(response.items);
      } else if (tab === "skills") {
        const response = await getEscoSkills(token, { q: searchValue, limit: 60 });
        setSkills(response.items);
      } else {
        const response = await getEscoOccupations(token, { q: searchValue, limit: 60 });
        setOccupations(response.items);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nu am putut incarca datele ESCO.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(activeTab, "");
  }, [token, activeTab]);

  const currentItems = useMemo(() => {
    if (activeTab === "isco-groups") {
      return iscoGroups;
    }
    if (activeTab === "skills") {
      return skills;
    }
    return occupations;
  }, [activeTab, iscoGroups, occupations, skills]);

  return (
    <div>
      <ModuleHeader
        title="ESCO Browser"
        description="Explorezi rapid taxonomiile ESCO deja importate in My Darrin. Uniclass si indicatorii de deviz raman pe fluxul manual, iar aici ne concentram pe cautare si verificare ESCO."
        badge="ESCO explorer"
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-5"><div className="text-sm text-muted">Tab activ</div><div className="mt-3 text-3xl font-semibold text-ink">{tabLabels[activeTab]}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Rezultate afisate</div><div className="mt-3 text-3xl font-semibold text-ink">{currentItems.length}</div></div>
        <div className="panel p-5"><div className="text-sm text-muted">Filtru</div><div className="mt-3 text-lg font-semibold text-ink">{query.trim() || "Toate inregistrarile"}</div></div>
      </div>

      {message ? <div className="mb-6 rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm text-muted">{message}</div> : null}

      <section className="panel p-6">
        <div className="flex flex-wrap gap-3">
          {(["isco-groups", "skills", "occupations"] as EscoTab[]).map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "btn-primary" : "btn-secondary"}
              type="button"
              onClick={() => setActiveTab(tab)}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        <form
          className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            void load(activeTab, query);
          }}
        >
          <input
            className="field"
            placeholder="Cauta dupa label, cod sau URI"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Se incarca..." : "Cauta"}
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => {
              setQuery("");
              void load(activeTab, "");
            }}
          >
            Reseteaza
          </button>
        </form>

        <div className="mt-6 grid gap-4">
          {activeTab === "isco-groups"
            ? iscoGroups.map((item) => (
                <article key={item.concept_uri} className="rounded-3xl border border-border bg-white/75 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-muted">{item.code ?? "Fara cod"}</div>
                      <h2 className="mt-2 text-xl font-semibold text-ink">{item.preferred_label ?? item.concept_uri}</h2>
                      <p className="mt-2 text-sm text-muted">{item.concept_uri}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-white/80 px-4 py-2 text-sm text-muted">{item.status ?? "released"}</div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted">{item.description || summarizeTerms(item.alt_labels)}</p>
                </article>
              ))
            : null}

          {activeTab === "skills"
            ? skills.map((item) => (
                <article key={item.concept_uri} className="rounded-3xl border border-border bg-white/75 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-muted">{item.reuse_level ?? "Reuse n/a"}</div>
                      <h2 className="mt-2 text-xl font-semibold text-ink">{item.preferred_label ?? item.concept_uri}</h2>
                      <p className="mt-2 text-sm text-muted">{item.concept_uri}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-white/80 px-4 py-2 text-sm text-muted">{item.status ?? "released"}</div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted">{item.description || summarizeTerms(item.alt_labels)}</p>
                  <div className="mt-4 text-sm text-muted">Tipuri skill: {item.skill_types.length ? item.skill_types.join(", ") : "nedefinite"}</div>
                </article>
              ))
            : null}

          {activeTab === "occupations"
            ? occupations.map((item) => (
                <article key={item.concept_uri} className="rounded-3xl border border-border bg-white/75 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-muted">{item.code ?? item.isco_group ?? "Occupation"}</div>
                      <h2 className="mt-2 text-xl font-semibold text-ink">{item.preferred_label ?? item.concept_uri}</h2>
                      <p className="mt-2 text-sm text-muted">{item.concept_uri}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-white/80 px-4 py-2 text-sm text-muted">{item.status ?? "released"}</div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted">{item.description || summarizeTerms(item.alt_labels)}</p>
                  <div className="mt-4 grid gap-2 text-sm text-muted md:grid-cols-3">
                    <div>ISCO group: {item.isco_group ?? "-"}</div>
                    <div>NACE: {item.nace_code ?? "-"}</div>
                    <div>Research: {item.research_occupation ? "Da" : "Nu"}</div>
                  </div>
                </article>
              ))
            : null}

          {!loading && currentItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-white/65 p-8 text-center text-sm text-muted">
              Nu exista rezultate pentru filtrul curent.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
