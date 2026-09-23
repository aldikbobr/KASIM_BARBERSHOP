import { SectionHead } from './SectionHead';
import { LOCATIONS } from '@/data';

export default function Barbers() {
  return (
    <section id="barbery" className="sec border-t border-[var(--border)]">
      <div className="wrap">
        <SectionHead
          eyebrow="Команда"
          title={
            <>
              Кто вас
              <br />
              <span className="gold-text">подстрижёт</span>
            </>
          }
          lead="У каждого филиала свой состав мастеров — поэтому при записи сначала выбираете филиал, а потом мастера из него."
        />

        {/* items-start: мастеров в филиалах разное число, иначе в коротких
            карточках снизу остаётся пустота на треть высоты */}
        <div className="rv-kids grid items-start gap-4 md:grid-cols-3">
          {LOCATIONS.map((l) => (
            <article
              key={l.name}
              className="rounded-[14px] border border-[var(--border)] bg-[var(--card)] p-7"
            >
              <h3 className="font-display text-[26px] font-medium tracking-[0.04em] uppercase">{l.name}</h3>
              <p className="text-[14.5px] text-[var(--muted)]">{l.address}</p>

              <ul
                aria-label={`Мастера филиала ${l.name}`}
                className="mt-6 flex flex-col gap-3 border-t border-[var(--border)] pt-6"
              >
                {l.masters.map((m) => (
                  <li key={m} className="flex items-center gap-3">
                    {/* Кружок с буквой — заглушка на месте фото мастера.
                        Появятся фото — сюда <img> вместо него, разметка та же. */}
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-black/30 font-display text-[13px] text-[var(--gold)]"
                    >
                      {m[0]}
                    </span>
                    <span className="font-display text-[17px] tracking-[0.04em] uppercase text-white/90">{m}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
