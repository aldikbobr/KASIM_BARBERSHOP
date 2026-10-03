import { useEffect, useRef } from 'react';
import { SectionHead } from './SectionHead';

// Фото команды и титулы — с личного сайта Касыма (репозиторий kasimm).
const TITLES = ['Чемпион Азии', 'Чемпион Европы'];

// Материалы с чемпионатов от заказчика (03.10.2026), /public/contests.
// Видео без звука, 540px по ширине; у видео рядом кадр-обложка с тем же именем.
const MEDIA = [
  { src: 'p-trophy.jpg', alt: 'Мастер Qasym с кубком за первое место и медалью' },
  { src: 'v-stage.mp4', alt: 'Мастер работает с моделью на чемпионате' },
  { src: 'p-contest.jpg', alt: 'Укладка модели во время конкурса' },
  { src: 'v-hall.mp4', alt: 'Конкурсный зал чемпионата по барберингу' },
  { src: 'v-barber.mp4', alt: 'Барбер стрижёт модель на соревновании' },
  { src: 'v-camera.mp4', alt: 'Конкурсанты за работой под камерами' },
  { src: 'v-arena.mp4', alt: 'Зал соревнований с рядами зеркал' },
  { src: 'v-design-1.mp4', alt: 'Конкурсная стрижка с рисунком бритвой' },
  { src: 'v-design-2.mp4', alt: 'Фейд с рисунком на виске' },
  { src: 'v-curly.mp4', alt: 'Кудрявая детская стрижка' },
  { src: 'p-neon.jpg', alt: 'Неоновая вывеска Kasym Barbershop, основан в 2020' },
];

export default function Contests() {
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
    <section id="sorevnovaniya" className="sec border-t border-[var(--border)]">
      <div className="wrap">
        <div className="grid items-center gap-12 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-16">
          <div>
            <SectionHead
              eyebrow="Соревнования"
              title={
                <>
                  Барберы-
                  <br />
                  <span className="gold-text">чемпионы</span>
                </>
              }
              lead="Команда Qasym выступает на чемпионатах по барберингу и привозит кубки в Петропавловск. Соревнования держат уровень: что работает на подиуме, мастера потом делают в зале."
            />

            <div className="rv flex flex-wrap gap-3">
              {TITLES.map((t) => (
                <div
                  key={t}
                  className="rounded-[14px] border border-[rgba(212,175,55,0.3)] bg-[var(--card)] px-5 py-4"
                >
                  <div className="font-display gold-text text-[20px] tracking-[0.04em] uppercase">{t}</div>
                  <div className="mt-0.5 text-[13px] text-[var(--muted)]">Касым Амангельдин, основатель</div>
                </div>
              ))}
            </div>
          </div>

          <figure className="rv mx-auto w-full max-w-[380px]">
            <div className="overflow-hidden rounded-[14px] ring-1 ring-white/[0.08]">
              <img
                src="/kasym-kubki.jpg"
                alt="Команда Qasym с кубками и флагом Казахстана на чемпионате"
                width={361}
                height={640}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover object-[50%_35%]"
              />
            </div>
            <figcaption className="mt-4 text-[13px] tracking-[0.06em] text-[var(--muted)]">
              Команда после чемпионата
            </figcaption>
          </figure>
        </div>

        <div ref={grid} className="rv-kids mt-14 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {MEDIA.map((m) => {
            const src = `/contests/${m.src}`;
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
      </div>
    </section>
  );
}
