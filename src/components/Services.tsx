import { MapPin } from 'lucide-react';
import { SectionHead } from './SectionHead';
import { SERVICES, PRICE_TIERS, PRICES_KIDS } from '@/data';

export default function Services() {
  return (
    <section id="uslugi" className="sec">
      <div className="wrap">
        <SectionHead
          eyebrow="Услуги и цены"
          title={
            <>
              Прайс
              <br />
              <span className="gold-text">без сюрпризов</span>
            </>
          }
          lead="Цена зависит от уровня мастера: мастер, топ-мастер или сам основатель. Все суммы в тенге."
        />

        <div className="rv mb-7 flex flex-wrap gap-x-6 gap-y-2">
          {PRICE_TIERS.map((tier, i) => (
            <div key={tier} className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  i === PRICE_TIERS.length - 1 ? 'bg-[var(--gold)]' : 'bg-white/25'
                }`}
              />
              <span
                className={`text-[12px] tracking-[0.14em] uppercase ${
                  i === PRICE_TIERS.length - 1 ? 'text-[var(--gold-soft)]' : 'text-[var(--muted)] opacity-70'
                }`}
              >
                {tier}
              </span>
            </div>
          ))}
        </div>

        <div className="rv-kids grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
          {SERVICES.map((s) => (
            <article
              key={s.name}
              className="group flex flex-col overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--card)] transition-all duration-300 hover:border-[var(--gold)] hover:bg-[#141414]"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={s.img}
                  alt={s.alt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent to-transparent" />
              </div>

              <div className="flex flex-1 flex-col p-4 md:p-5">
                <h3 className="font-display text-[16px] font-medium tracking-[0.04em] uppercase md:text-[17px]">
                  {s.name}
                </h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--muted)] opacity-80 md:text-[13px]">
                  {s.desc}
                </p>
                {s.where && (
                  <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-[var(--gold-soft)] opacity-90 md:text-[12px]">
                    <MapPin size={12} aria-hidden="true" className="shrink-0" />
                    {s.where}
                  </p>
                )}

                {!s.prices ? (
                  <div className="mt-auto pt-4">
                    {s.masters && (
                      <p className="mb-2 text-[11.5px] leading-snug text-[var(--muted)] md:text-[12px]">
                        Делают: {s.masters}
                      </p>
                    )}
                    <div className="font-display gold-text text-[15px] tracking-[0.02em] md:text-[16px]">{s.price}</div>
                  </div>
                ) : (
                <>
                {/* примечание над ценами, чтобы ряды цен во всех карточках оставались внизу на одном уровне */}
                {s.note && (
                  <p className="mt-2 text-[11.5px] text-[var(--gold-soft)] opacity-80 md:text-[12px]">{s.note}</p>
                )}
                {/* Телефон: узкая карточка, «Основатель» в колонку не влезает — строками. */}
                <div className="mt-auto flex flex-col gap-1 pt-4 sm:flex-row sm:gap-2">
                  {s.prices.map((price, i) => (
                    <div key={PRICE_TIERS[i]} className="flex items-baseline justify-between gap-2 sm:block sm:flex-1">
                      <div
                        className={`text-[9px] tracking-[0.12em] uppercase ${
                          i === PRICE_TIERS.length - 1 ? 'text-[var(--gold)] opacity-80' : 'text-[var(--muted)] opacity-50'
                        }`}
                      >
                        {PRICE_TIERS[i]}
                      </div>
                      <div
                        className={`font-display text-[14px] tracking-[0.02em] sm:mt-0.5 md:text-[15px] ${
                          price === '—'
                            ? 'text-[var(--muted)] opacity-30'
                            : i === s.prices.length - 1
                              ? 'gold-text'
                              : 'text-white opacity-90'
                        }`}
                      >
                        {price}
                      </div>
                    </div>
                  ))}
                </div>
                </>
                )}
              </div>
            </article>
          ))}
        </div>

        <p className="rv mt-5 text-[13px] text-[var(--muted)] opacity-60">
          Цены могут меняться — актуальные уточняйте при записи.
        </p>

        <div className="rv mt-12">
          <div className="overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--card)] p-7">
            <h3 className="mb-5 text-[11px] tracking-[0.2em] text-[var(--gold)] uppercase">Дети и студенты</h3>
            <dl className="grid gap-3 md:grid-cols-2 md:gap-x-14">
              {PRICES_KIDS.map((row) => (
                <div key={row.service} className="flex items-baseline justify-between gap-4">
                  <dt className="text-[15px] text-[var(--muted)]">{row.service}</dt>
                  <dd className="font-display text-[17px] text-white opacity-90">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
