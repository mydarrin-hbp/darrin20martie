export function ModuleHeader({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="text-xs uppercase tracking-[0.22em] text-muted">Back Office Module</div>
        <h2 className="mt-2 text-4xl font-semibold tracking-tight text-ink">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{description}</p>
      </div>
      {badge ? <span className="tag">{badge}</span> : null}
    </div>
  );
}
