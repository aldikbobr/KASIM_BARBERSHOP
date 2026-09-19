interface SectionHeadProps {
  eyebrow: string;
  title: React.ReactNode;
  lead: string;
}

export function SectionHead({ eyebrow, title, lead }: SectionHeadProps) {
  return (
    <div className="rv mb-13">
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="h2">{title}</h2>
      <p className="mt-4 max-w-[56ch] text-[15.5px] text-[var(--muted)]">{lead}</p>
    </div>
  );
}
