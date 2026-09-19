import { REVIEWS, RATING, TWOGIS_URL } from '@/data';
import { Star } from 'lucide-react';

export default function Reviews() {
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

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
          {REVIEWS.map((review) => (
            <figure
              key={review.name}
              className="rv flex flex-col gap-4 rounded-[14px] border border-[var(--border)] bg-[var(--card)] p-7 transition-colors duration-300 hover:border-[var(--gold)] hover:border-opacity-30"
            >
              <div className="flex gap-0.5 text-[var(--gold)]" aria-label="Оценка 5 из 5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <blockquote className="text-[14.5px] leading-relaxed text-[var(--muted)]">{review.text}</blockquote>
              <figcaption className="text-[13px] tracking-[0.06em] text-white opacity-80">
                {review.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
