import { SectionHead } from './SectionHead';
import { FRANCHISE, FRANCHISE_WA } from '@/data';

export default function Franchise() {
  return (
    <section id="franshiza" className="sec border-t border-[var(--border)]">
      <div className="wrap">
        <SectionHead
          eyebrow="Франшиза"
          title={
            <>
              Qasym Barbershop
              <br />
              <span className="gold-text">в вашем городе</span>
            </>
          }
          lead="Сеть растёт через франчайзинг: передаём проверенную модель, стандарты сервиса и фирменный стиль предпринимателям в других городах Казахстана."
        />

        <div className="rv-kids grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FRANCHISE.map((f, i) => (
            <article
              key={f.title}
              className="rounded-[14px] border border-[var(--border)] bg-[var(--card)] p-7 transition-colors duration-300 hover:border-[var(--gold)] hover:border-opacity-30"
            >
              <div className="font-display text-[15px] tracking-[0.1em] text-[var(--gold)]">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="mt-4 font-display text-[21px] leading-tight font-medium tracking-[0.03em] uppercase">
                {f.title}
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[var(--muted)]">{f.text}</p>
            </article>
          ))}
        </div>

        <div className="rv mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a href={FRANCHISE_WA} target="_blank" rel="noopener" className="btn btn-gold">
            Обсудить франшизу
          </a>
          <p className="text-[14.5px] text-[var(--muted)]">Напишите в WhatsApp — расскажем об условиях.</p>
        </div>
      </div>
    </section>
  );
}
