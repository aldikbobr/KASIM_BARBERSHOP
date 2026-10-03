import { SectionHead } from './SectionHead';
import { FOUNDER_PATH } from '@/data';

export default function Founder() {
  return (
    <section id="osnovatel" className="sec border-t border-[var(--border)]">
      <div className="wrap grid items-start gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
        <figure className="rv mx-auto w-full max-w-[420px] md:sticky md:top-24">
          <div className="overflow-hidden rounded-[14px] ring-1 ring-white/[0.08]">
            <img
              src="/kasym-about.jpg"
              alt="Касым Амангельдин, основатель Qasym Barbershop"
              width={840}
              height={1260}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover object-top"
            />
          </div>
          <figcaption className="mt-4 text-[13px] tracking-[0.06em] text-[var(--muted)]">
            Основатель и главный барбер сети
          </figcaption>
        </figure>

        <div>
          <SectionHead
            eyebrow="Основатель"
            title={
              <>
                Касым
                <br />
                <span className="gold-text">Амангельдин</span>
              </>
            }
            lead="Ставка на классическую школу: точная геометрия стрижки, опасное бритьё и сервис, в котором каждый визит — личный ритуал. Сам обучает мастеров сети."
          />

          <ol className="rv-kids border-t border-[var(--border)]">
            {FOUNDER_PATH.map((p) => (
              <li
                key={p.when}
                className="grid gap-1.5 border-b border-[var(--border)] py-5 sm:grid-cols-[120px_1fr] sm:gap-6"
              >
                <span className="font-display text-[22px] leading-tight font-medium tracking-[0.04em] uppercase gold-text">
                  {p.when}
                </span>
                <p className="text-[15px] leading-relaxed text-[var(--muted)]">{p.text}</p>
              </li>
            ))}
          </ol>

          <blockquote className="rv mt-10 border-l border-[var(--gold)] pl-6">
            <p className="font-display text-[clamp(20px,2.4vw,26px)] leading-snug tracking-[0.02em] text-white/90">
              «Правильно подобранный образ — залог уверенности в себе. А уверенный мужчина способен на великие дела».
            </p>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
