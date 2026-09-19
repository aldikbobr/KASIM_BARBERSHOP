import { SectionHead } from './SectionHead';
import { SERVICES, PRICE_TIERS, PRICES_KIDS, PRICES_BUNDLES } from '@/data';

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
          lead="Цена зависит от уровня мастера. Все суммы в тенге."
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

                <div className="mt-auto flex gap-2 pt-4">
                  {s.prices.map((price, i) => (
                    <div key={PRICE_TIERS[i]} className="flex-1">
                      <div
                        className={`text-[9px] tracking-[0.12em] uppercase ${
                          i === PRICE_TIERS.length - 1 ? 'text-[var(--gold)] opacity-80' : 'text-[var(--muted)] opacity-50'
                        }`}
                      >
                        {PRICE_TIERS[i]}
                      </div>
                      <div
                        className={`mt-0.5 font-display text-[14px] tracking-[0.02em] md:text-[15px] ${
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
              </div>
            </article>
          ))}
        </div>

        <p className="rv mt-5 text-[13px] text-[var(--muted)] opacity-60">
          Цены могут меняться — актуальные уточняйте при записи.
        </p>

        <div className="rv-kids mt-12 grid gap-4 md:grid-cols-2">
          <div className="overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--card)] p-7">
            <h3 className="mb-5 text-[11px] tracking-[0.2em] text-[var(--gold)] uppercase">Дети и студенты</h3>
            <dl className="flex flex-col gap-3">
              {PRICES_KIDS.map((row) => (
                <div key={row.service} className="flex items-baseline justify-between gap-4">
                  <dt className="text-[15px] text-[var(--muted)]">{row.service}</dt>
                  <dd className="font-display text-[17px] text-white opacity-90">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="overflow-hidden rounded-[14px] border border-[var(--gold)] border-opacity-30 bg-[var(--card)] p-7"
            style={{
              background: 'radial-gradient(80% 120% at 100% 0%, rgba(212,175,55,0.10), transparent 60%)',
            }}
          >
            <h3 className="mb-5 text-[11px] tracking-[0.2em] text-[var(--gold)] uppercase">Комплексы</h3>
            <dl className="flex flex-col gap-5">
              {PRICES_BUNDLES.map((row) => (
                <div key={row.title} className="flex items-baseline justify-between gap-4">
                  <div>
                    <dt className="text-[15px]">{row.title}</dt>
                    <p className="mt-1 text-[13px] text-[var(--muted)]">{row.text}</p>
                  </div>
                  <dd className="flex shrink-0 items-baseline gap-2">
                    {row.was && (
                      <span className="text-[13px] text-[var(--muted)] opacity-50 line-through">{row.was}</span>
                    )}
                    <span className="font-display gold-text text-[19px]">{row.value}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
