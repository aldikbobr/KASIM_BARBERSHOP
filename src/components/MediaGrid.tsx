import { useEffect, useRef } from 'react';

interface MediaGridProps {
  dir: string;
  items: { src: string; alt: string }[];
  className: string;
}

// Плитки фото и видео из /public/<dir>. Видео без звука, у каждого рядом кадр-обложка с тем же именем.
export function MediaGrid({ dir, items, className }: MediaGridProps) {
  const grid = useRef<HTMLDivElement>(null);

  // Ролик играет, только пока виден; при «уменьшить движение» остаются обложки.
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
    <div ref={grid} className={`rv-kids grid grid-cols-2 gap-3 md:gap-4 ${className}`}>
      {items.map((m) => {
        const src = `/${dir}/${m.src}`;
        return (
          <div
            key={m.src}
            className="group relative aspect-[3/4] overflow-hidden rounded-[14px] ring-1 ring-white/[0.08]"
          >
            {m.src.endsWith('.mp4') ? (
              <video
                src={src}
                poster={src.replace('.mp4', '.jpg')}
                aria-label={m.alt}
                muted
                loop
                playsInline
                preload="none"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            ) : (
              <img
                src={src}
                alt={m.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
