import { SectionHead } from './SectionHead';
import { LOCATIONS } from '@/data';

export default function Locations() {
  return (
    <section id="filialy" className="sec border-t border-[var(--border)]">
      <div className="wrap">
        <SectionHead
          eyebrow="Филиалы"
          title={
            <>
              Три адреса
              <br />в Петропавловске
            </>
          }
          lead="Пишите в WhatsApp нужного филиала — ответим и подберём время."
        />

        <div className="rv-kids grid gap-4 md:grid-cols-3">
          {LOCATIONS.map((l) => (
            <article
              key={l.name}
              className="flex flex-col gap-1.5 rounded-[14px] border border-[var(--border)] bg-[var(--card)] p-7 transition-colors duration-300 hover:border-[var(--gold)] hover:border-opacity-30 hover:bg-[#141414]"
            >
              <h3 className="font-display text-[26px] font-medium tracking-[0.04em] uppercase">{l.name}</h3>
              <p className="text-[14.5px] text-[var(--muted)]">{l.address}</p>
              <p className="text-[13px] tracking-[0.06em] text-[var(--muted)] opacity-70">Ежедневно 10:00—20:00</p>
              <a href={l.wa} target="_blank" rel="noopener" className="btn btn-ghost mt-5 self-start">
                WhatsApp
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
