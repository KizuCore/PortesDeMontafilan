export function Field({
  name,
  label,
  type = "text",
  required,
  textarea,
  className = "",
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  className?: string;
}) {
  const base =
    "w-full rounded-lg border border-background/20 bg-background/5 px-4 py-3 text-background placeholder:text-background/40 focus:border-terra focus:outline-none focus:ring-2 focus:ring-clay/30 transition-colors";
  return (
    <label className={`block text-sm ${className}`}>
      <span className="block text-background/70 text-xs uppercase tracking-wider">
        {label}
      </span>
      {textarea ? (
        <textarea
          name={name}
          required={required}
          rows={5}
          className={`${base} mt-2 resize-none`}
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          className={`${base} mt-2`}
        />
      )}
    </label>
  );
}
