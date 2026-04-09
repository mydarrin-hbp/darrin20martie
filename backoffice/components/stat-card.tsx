export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="panel p-5">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-3 text-4xl font-semibold text-ink">{value}</div>
      <div className="mt-3 text-sm text-muted">{hint}</div>
    </div>
  );
}
