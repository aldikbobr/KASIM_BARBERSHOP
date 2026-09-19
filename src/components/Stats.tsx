import { STATS } from '@/data';

export default function Stats() {
  return (
    <div className="rv-kids grid grid-cols-2 gap-px border-y border-[var(--border)] bg-[rgba(255,255,255,0.08)] md:grid-cols-4">
      {STATS.map((s) => (
        <div key={s.label} className="bg-[var(--background)] px-6 py-9">
          <div
            className={`font-display text-[clamp(30px,4.4vw,48px)] leading-none font-medium ${s.gold ? 'gold-text' : ''}`}
          >
            {s.n}
          </div>
          <div className="mt-2.5 text-xs tracking-[0.14em] uppercase text-[var(--muted)] opacity-70">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
