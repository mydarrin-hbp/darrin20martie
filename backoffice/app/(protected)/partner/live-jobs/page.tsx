"use client";

import { useEffect, useState } from "react";

import { ModuleHeader } from "@/components/module-header";
import { useAuth } from "@/components/auth-provider";
import { PartnerLiveJobRecord, claimPartnerLiveJob, getPartnerLiveJobs } from "@/lib/api";

export default function PartnerLiveJobsPage() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState<PartnerLiveJobRecord[]>([]);
  const [worksheetJob, setWorksheetJob] = useState<PartnerLiveJobRecord | null>(null);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function load() {
    if (!token) return;
    try {
      const data = await getPartnerLiveJobs(token);
      setJobs(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Nu am putut incarca joburile live.");
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  async function handleClaim(job: PartnerLiveJobRecord) {
    if (!token) return;
    setError("");
    setMessage("");
    try {
      await claimPartnerLiveJob(token, job.broadcast_id);
      setWorksheetJob(job);
      setMessage("Lucrarea a fost alocata partenerului curent.");
      await load();
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : "Claim esuat.");
    }
  }

  return (
    <div className="grid gap-6">
      <ModuleHeader
        title="Live Jobs & Claim"
        description="Portalul partenerului afiseaza comenzile eligibile, cronometru pentru Full Package Priority si transparenta completa asupra sumelor brute, retentiei My Darrin si netului de incasat."
        badge="Partner"
      />

      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

      {worksheetJob ? (
        <section className="panel p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.22em] text-muted">Fisa de lucru</div>
              <h2 className="mt-2 text-2xl font-semibold text-ink">{worksheetJob.asset_label ?? worksheetJob.service_name}</h2>
              <div className="mt-2 text-sm text-muted">{worksheetJob.intervention_label ?? "Interventie activa"}</div>
            </div>
            <span className="tag">ASSIGNED</span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-white/70 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted">Task specific</div>
              <div className="mt-2 text-lg font-semibold text-ink">{worksheetJob.task_label ?? "Task in curs de confirmare"}</div>
            </div>
            <div className="rounded-2xl border border-border bg-white/70 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted">Echipa necesara</div>
              <div className="mt-2 text-lg font-semibold text-ink">{worksheetJob.required_people ?? 1} oameni</div>
              <div className="mt-1 text-sm text-muted">{worksheetJob.skill_label ?? "Skill operational standard"}</div>
            </div>
            <div className="rounded-2xl border border-border bg-white/70 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted">Autorizari</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(worksheetJob.required_certification_codes.length ? worksheetJob.required_certification_codes : ["Fara cerinte suplimentare"]).map((item) => (
                  <span key={item} className="tag">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {worksheetJob.can_cover_full_package ? (
            <div className="mt-4 rounded-2xl border border-[#117a73]/15 bg-[#117a73]/5 px-4 py-4">
              <div className="text-xs uppercase tracking-[0.18em] text-[#117a73]">Consumabile standard</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(worksheetJob.standard_consumables.length ? worksheetJob.standard_consumables : ["Consumabilele vor fi confirmate la pornirea executiei"]).map((item) => (
                  <span key={item} className="tag">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="grid gap-4">
        {jobs.map((job) => (
          <article key={job.broadcast_id} className="panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-muted">{job.service_slug}</div>
                <h2 className="mt-2 text-2xl font-semibold text-ink">{job.service_name}</h2>
                <div className="mt-2 text-sm text-muted">{job.target_address}</div>
                {job.locality_slug ? <div className="mt-1 text-xs text-muted">Zona: {job.locality_slug}</div> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="tag">{job.claim_status}</span>
                {job.can_cover_full_package ? <span className="tag">Full package</span> : null}
                {job.full_package_priority_seconds > 0 ? <span className="tag">Prioritate {job.full_package_priority_seconds}s</span> : null}
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-border bg-white/70 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted">Brut client</div>
                <div className="mt-2 text-2xl font-semibold text-ink">{job.client_gross_total.toFixed(2)} RON</div>
              </div>
              <div className="rounded-2xl border border-border bg-white/70 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted">Retentie My Darrin</div>
                <div className="mt-2 text-2xl font-semibold text-ink">{job.mydarrin_retention.toFixed(2)} RON</div>
              </div>
              <div className="rounded-2xl border border-border bg-white/70 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted">Escrow 5%</div>
                <div className="mt-2 text-2xl font-semibold text-ink">{job.escrow_retention.toFixed(2)} RON</div>
              </div>
              <div className="rounded-2xl border border-border bg-white/70 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted">Net incasat</div>
                <div className="mt-2 text-2xl font-semibold text-ink">{job.partner_net_receivable.toFixed(2)} RON</div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[#117a73]/15 bg-[#117a73]/5 px-4 py-3 text-sm text-muted">
              Insurance Fee: {job.insurance_fee.toFixed(2)} RON · Acceptarea este permisa doar daca documentele critice sunt valide.
            </div>

            {job.blocking_reasons.length ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <div className="font-semibold">Documente lipsa / expirate</div>
                <ul className="mt-2 list-disc pl-5">
                  {job.blocking_reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-white/70 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted">Task specific</div>
                <div className="mt-2 text-base font-semibold text-ink">{job.task_label ?? "Task in curs de confirmare"}</div>
              </div>
              <div className="rounded-2xl border border-border bg-white/70 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted">Echipa</div>
                <div className="mt-2 text-base font-semibold text-ink">{job.required_people ?? 1} oameni</div>
                <div className="mt-1 text-sm text-muted">{job.skill_label ?? "Skill standard"}</div>
              </div>
              <div className="rounded-2xl border border-border bg-white/70 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted">Skill matrix</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.esco_codes.concat(job.nace_codes).map((code) => (
                    <span key={code} className="tag">
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button className="btn-primary" type="button" disabled={!job.can_claim} onClick={() => void handleClaim(job)}>
                Accepta lucrarea
              </button>
              <a className="btn-secondary" href="/profile">
                Validare documente
              </a>
            </div>
          </article>
        ))}

        {jobs.length === 0 ? (
          <article className="panel p-6 text-sm text-muted">
            Nu exista joburi live eligibile pentru partenerul curent sau nu este inca legat de un profil de furnizor valid.
          </article>
        ) : null}
      </section>
    </div>
  );
}
