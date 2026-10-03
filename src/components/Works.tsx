import { SectionHead } from './SectionHead';
import { WORKS } from '@/data';

export default function Works() {
  return (
    <section id="raboty" className="sec overflow-hidden border-t border-[var(--border)]">
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
          lead="Работы наших мастеров. Переход, линия бороды, шея — то, на чём стрижка держится или разваливается."
        />
      </div>

      {/*
        3D-карусель: карточки стоят по кругу (каждая повёрнута на 360°/n и
        отодвинута на радиус), кольцо целиком медленно вращается. Курсор
        останавливает вращение, чтобы фото можно было рассмотреть.
      */}
      {/* Каждое фото дважды: кольцо плотнее, а копии стоят друг напротив друга
          и одновременно на переднем плане не появляются. Копии скрыты от читалок. */}
      <div className="karusel" style={{ ['--n' as string]: WORKS.length * 2 }}>
        <div className="karusel-ring">
          {[...WORKS, ...WORKS].map((w, i) => (
            <figure
              key={i}
              className="karusel-card"
              style={{ ['--i' as string]: i }}
              aria-hidden={i >= WORKS.length || undefined}
            >
              {/* без loading="lazy": повёрнутые в 3D карточки браузер считает невидимыми и не грузит */}
              <img src={w.src} alt={i < WORKS.length ? w.alt : ''} className="h-full w-full object-cover" />
            </figure>
          ))}
        </div>
      </div>

      <style>{`
        .karusel {
          /* радиус под 12 карточек: хорда 2r·sin(15°) ≈ ширина карточки + зазор */
          --w: clamp(140px, 17vw, 230px);
          --r: calc(var(--w) * 2.1);
          perspective: 2000px;
          height: calc(var(--w) * 4 / 3 * 1.45);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .karusel-ring {
          position: relative;
          width: var(--w);
          aspect-ratio: 3 / 4;
          transform-style: preserve-3d;
          animation: karusel-spin 60s linear infinite;
        }
        .karusel:hover .karusel-ring { animation-play-state: paused; }
        .karusel-card {
          position: absolute;
          inset: 0;
          margin: 0;
          overflow: hidden;
          border-radius: 14px;
          border: 1px solid rgba(212,175,55,.25);
          box-shadow: 0 18px 40px rgba(0,0,0,.55);
          backface-visibility: hidden;
          transform: rotateY(calc(var(--i) * 360deg / var(--n))) translateZ(var(--r));
        }
        @keyframes karusel-spin {
          from { transform: rotateX(-6deg) rotateY(0deg); }
          to   { transform: rotateX(-6deg) rotateY(-360deg); }
        }

        /* «Уменьшить движение»: вместо вращения обычная сетка */
        @media (prefers-reduced-motion: reduce) {
          .karusel { height: auto; perspective: none; padding-inline: 24px; }
          .karusel-ring {
            width: 100%; max-width: 1132px; aspect-ratio: auto; animation: none;
            display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px;
          }
          .karusel-card { position: relative; aspect-ratio: 3 / 4; transform: none; }
          .karusel-card[aria-hidden] { display: none; }
        }
      `}</style>
    </section>
  );
}
