import { useEffect, useRef } from 'react';
import { SectionHead } from './SectionHead';
import { WORKS } from '@/data';

export default function Works() {
  const grid = useRef<HTMLDivElement>(null);

  // Ролик играет, только пока виден: не качаем все 5 МБ видео сразу и не греем телефон.
  // При «уменьшить движение» остаются обложки.
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }
      },
      { threshold: 0.25 },
    );
    grid.current?.querySelectorAll('video').forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  return (
    <section id="raboty" className="sec border-t border-[var(--border)]">
      <div className="wrap">
        <SectionHead
          eyebrow="Работы"
          title={
            <>
              Видно
              <br />
              <span className="gold-text">по контуру</span>
            </>
          }
          lead="Живые видео из наших филиалов. Переход, линия бороды, шея — то, на чём стрижка держится или разваливается."
        />

        <div ref={grid} className="rv-kids grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {WORKS.map((w) => (
            <div
              key={w.name}
              className="group relative aspect-[3/4] overflow-hidden rounded-[14px] ring-1 ring-white/[0.08]"
            >
              <video
                src={`/works/${w.name}.mp4`}
                poster={`/works/${w.name}.jpg`}
                aria-label={w.alt}
                muted
                loop
                playsInline
                preload="none"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
