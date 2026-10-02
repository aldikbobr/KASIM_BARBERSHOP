import { REVIEWS, RATING, TWOGIS_URL, type Review } from '@/data';
import { Star, Quote } from 'lucide-react';

// Водопад перенесён с личного сайта Касыма (репозиторий kasimm).

/** Раскладываем отзывы по колонкам по очереди, чтобы длинные и короткие
 *  перемешались и колонки вышли примерно одной высоты. */
function poKolonkam(items: Review[], n: number): Review[][] {
  const cols: Review[][] = Array.from({ length: n }, () => []);
  items.forEach((r, i) => cols[i % n].push(r));
  return cols;
}

function Kartochka({ review }: { review: Review }) {
  return (
    <figure className="vodopad-card relative mb-4 flex flex-col gap-4 rounded-[14px] p-7">
      <Quote
        size={38}
        aria-hidden="true"
        className="pointer-events-none absolute right-5 top-5 text-[var(--gold)] opacity-[0.07]"
      />
      <div className="flex gap-0.5 text-[var(--gold)]" aria-label="Оценка 5 из 5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} fill="currentColor" aria-hidden="true" />
        ))}
      </div>
      <blockquote className="text-[14.5px] leading-relaxed text-white/80">{review.text}</blockquote>
      <figcaption className="flex items-baseline justify-between gap-3 text-[13px]">
        <span className="tracking-[0.04em] text-[var(--gold-soft)]">{review.name}</span>
        <span className="shrink-0 text-[12px] text-[var(--muted)]">
          {review.branch} · {review.date}
        </span>
      </figcaption>
    </figure>
  );
}

export default function Reviews() {
  // 3 колонки на компьютере, 2 на планшете, 1 на телефоне: считаем максимум,
  // лишние прячем через CSS — так не нужен слушатель ресайза.
  const cols = poKolonkam(REVIEWS, 3);

  return (
    <section id="otzyvy" className="sec border-t border-[var(--border)]">
      <div className="wrap">
        <div className="rv mb-13 flex flex-wrap items-end justify-between gap-8">
          <div>
            <div className="eyebrow">Отзывы</div>
            <h2 className="h2">
              Что говорят
              <br />
              <span className="gold-text">клиенты</span>
            </h2>
          </div>

          <a
            href={TWOGIS_URL}
            target="_blank"
            rel="noopener"
            className="flex items-baseline gap-3 transition-opacity duration-300 hover:opacity-80"
          >
            <span className="font-display gold-text text-[56px] leading-none font-medium">{RATING.score}</span>
            <span className="text-[13px] text-[var(--muted)]">
              {RATING.votes} оценок
              <br />
              {RATING.reviews} отзывов в 2ГИС
            </span>
          </a>
        </div>
      </div>

      {/*
        Водопад: каждая колонка едет сама, соседние — в разные стороны.
        Содержимое колонки продублировано, а анимация сдвигает ровно на
        половину высоты — на стыке кадр совпадает, и склейки не видно.
        Курсор останавливает только ту колонку, над которой стоит.
      */}
      <div className="vodopad relative" aria-label="Отзывы клиентов">
        <div className="wrap grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cols.map((col, i) => (
            <div
              key={i}
              className={`vodopad-col ${i === 1 ? 'hidden md:block' : ''} ${i === 2 ? 'hidden lg:block' : ''}`}
              style={{ ['--dur' as string]: `${70 + i * 10}s` }}
              data-dir={i % 2 === 1 ? 'vniz' : 'vverh'}
            >
              <div className="vodopad-lenta">
                {col.map((r) => (
                  <Kartochka key={r.name} review={r} />
                ))}
                {/* копия для бесшовного стыка, для читалок скрыта */}
                <div aria-hidden="true">
                  {col.map((r) => (
                    <Kartochka key={r.name} review={r} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* края растворяются, чтобы карточки не обрубались на границе */}
        <div className="vodopad-kraj vodopad-kraj-verh" aria-hidden="true" />
        <div className="vodopad-kraj vodopad-kraj-niz" aria-hidden="true" />
      </div>

      <style>{`
        .vodopad { height: 78vh; min-height: 540px; overflow: hidden; }
        .vodopad-col { overflow: hidden; }
        .vodopad-lenta {
          animation: vodopad-vverh var(--dur, 70s) linear infinite;
          will-change: transform;
        }
        .vodopad-col[data-dir="vniz"] .vodopad-lenta { animation-name: vodopad-vniz; }
        .vodopad-col:hover .vodopad-lenta { animation-play-state: paused; }

        /* Светящийся контур: золотой градиент, из которого маской вырезана
           середина — остаётся кромка в 1px. Обычный border градиент не берёт. */
        .vodopad-card {
          background-color: rgba(14,14,14,.72);
          border: 1px solid var(--border);
          transition: box-shadow .35s var(--ease), background-color .35s var(--ease), border-color .35s var(--ease);
        }
        .vodopad-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(140deg, rgba(212,175,55,0) 0%, rgba(212,175,55,.85) 35%,
            rgba(247,235,192,1) 50%, rgba(212,175,55,.85) 65%, rgba(212,175,55,0) 100%);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
          opacity: 0;
          transition: opacity .35s var(--ease);
          pointer-events: none;
        }
        @media (hover: hover) and (pointer: fine) {
          .vodopad-card:hover::before { opacity: 1; }
          .vodopad-card:hover {
            background-color: rgba(22,17,10,.88);
            border-color: rgba(212,175,55,.22);
            box-shadow: 0 0 26px rgba(212,175,55,.16), 0 16px 38px rgba(0,0,0,.5);
          }
        }

        @keyframes vodopad-vverh { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        @keyframes vodopad-vniz { from { transform: translateY(-50%); } to { transform: translateY(0); } }

        .vodopad-kraj { position: absolute; left: 0; right: 0; height: 90px; pointer-events: none; z-index: 2; }
        .vodopad-kraj-verh { top: 0; background: linear-gradient(to bottom, var(--background), transparent); }
        .vodopad-kraj-niz { bottom: 0; background: linear-gradient(to top, var(--background), transparent); }

        /* Движущийся текст мешает читать — при «уменьшить движение»
           лента стоит, секция становится обычным списком. */
        @media (prefers-reduced-motion: reduce) {
          .vodopad { height: auto; min-height: 0; overflow: visible; }
          .vodopad-lenta { animation: none; }
          .vodopad-lenta > [aria-hidden="true"] { display: none; }
          .vodopad-kraj { display: none; }
        }
      `}</style>
    </section>
  );
}
