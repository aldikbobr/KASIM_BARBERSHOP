import { useEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import { RATING, TWOGIS_URL } from '@/data';

interface HeroProps {
  onBooking: () => void;
}

// Живое видео из филиала вместо стокового фото. Тот же файл, что и в «Работах»,
// поэтому браузер качает его один раз.
const VIDEO = { src: '/works/razor-shave.mp4', poster: '/works/razor-shave.jpg' };

export default function Hero({ onBooking }: HeroProps) {
  const video = useRef<HTMLVideoElement>(null);

  // При «уменьшить движение» видео стоит на первом кадре.
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) video.current?.pause();
  }, []);

  const splitTitle = (text: string) =>
    text.split('').map((char, i) => (
      <span
        key={`${char}-${i}`}
        className="char-in bg-gradient-to-b from-[#f7ebc0] via-[#d4af37] to-[#8a6a2f] bg-clip-text text-transparent"
        style={{ animationDelay: `${i * 0.06}s` }}
      >
        {char === ' ' ? ' ' : char}
      </span>
    ));

  return (
    <section id="top" className="relative min-h-screen overflow-hidden">
      {/* Компьютер: фон — размытый кадр из того же видео, само видео — карточкой справа */}
      <div className="absolute inset-0 hidden lg:block" aria-hidden="true">
        <img src={VIDEO.poster} alt="" className="h-full w-full scale-110 object-cover opacity-40 blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(7,7,7,0.4)] via-[rgba(7,7,7,0.55)] to-[#070707]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,7,7,0.85)] via-[rgba(7,7,7,0.4)] to-transparent" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(58%_46%_at_26%_40%,rgba(212,175,55,0.2)_0%,transparent_68%)]" />

      <div className="relative z-10 flex min-h-screen flex-col justify-center">
        <div className="wrap flex items-center justify-between gap-12 pt-20 pb-24">
          <div>
            <div className="fade-in-up" style={{ animationDelay: '0.05s' }}>
              <img
                src="/crest.png"
                alt="Герб Qasym Barbershop"
                width={560}
                height={560}
                className="mb-5 w-[clamp(96px,13vw,158px)] object-contain drop-shadow-[0_0_28px_rgba(212,175,55,0.28)]"
              />
            </div>

            <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
              <p className="eyebrow">Барбершоп №1 · Петропавловск</p>
            </div>

            <h1 className="font-display text-[clamp(52px,13.5vw,200px)] leading-[0.95] font-medium tracking-[0.01em] uppercase lg:text-[clamp(96px,11vw,168px)]">
              {splitTitle('QASYM')}
            </h1>

            <div className="fade-in-up mt-6 max-w-xl" style={{ animationDelay: '0.5s' }}>
              <p className="text-[clamp(16px,2vw,20px)] leading-relaxed text-white/75">
                Три филиала, барберы-чемпионы,
                <br />
                ежедневно с 10:00 до 20:00
              </p>
              <a
                href={TWOGIS_URL}
                target="_blank"
                rel="noopener"
                className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-[13px] text-white/80 backdrop-blur-sm transition-colors hover:border-[rgba(212,175,55,0.4)]"
              >
                <span className="flex gap-0.5 text-[var(--gold)]" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" />
                  ))}
                </span>
                <span>
                  <b className="font-semibold text-white">{RATING.score}</b> в 2ГИС · {RATING.votes} оценок
                </span>
              </a>
            </div>

            <div className="fade-in-up mt-8 flex flex-wrap gap-3" style={{ animationDelay: '0.7s' }}>
              <button onClick={onBooking} className="btn btn-gold">
                Записаться
              </button>
              <a href="#filialy" className="btn btn-ghost">
                Филиалы
              </a>
            </div>
          </div>

          {/* Одно видео на обе раскладки: на телефоне растянуто фоном на весь
              экран (absolute от блока выше), с компьютера — карточка справа. */}
          <figure className="absolute inset-0 -z-10 m-0 lg:relative lg:inset-auto lg:z-auto lg:aspect-[9/16] lg:h-[min(74vh,680px)] lg:shrink-0 lg:overflow-hidden lg:rounded-[22px] lg:shadow-[0_30px_80px_rgba(0,0,0,0.65)] lg:ring-1 lg:ring-[rgba(212,175,55,0.25)]">
            <video
              ref={video}
              src={VIDEO.src}
              poster={VIDEO.poster}
              aria-label="Барбер стрижёт клиента и оформляет бороду опасной бритвой"
              autoPlay
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
            {/* на телефоне затемняем видео под текстом */}
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(7,7,7,0.6)] via-[rgba(7,7,7,0.55)] to-[#070707] lg:hidden" />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,7,7,0.7)] to-transparent lg:hidden" />
          </figure>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[10px] tracking-[0.3em] uppercase text-[var(--muted)]">Листайте</span>
        <div className="scroll-bounce">
          <svg width="14" height="20" viewBox="0 0 14 20" fill="none" className="text-[var(--gold)]">
            <rect x="0.5" y="0.5" width="13" height="19" rx="6.5" stroke="currentColor" opacity="0.4" />
            <circle cx="7" cy="6" r="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>
    </section>
  );
}
