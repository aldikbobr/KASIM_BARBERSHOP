import { SectionHead } from './SectionHead';
import { WORKS } from '@/data';

export default function Works() {
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
          lead="Переход, линия бороды, шея — то, на чём стрижка держится или разваливается."
        />

        <div className="rv-kids grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {WORKS.map((w) => (
            <div
              key={w.src}
              className="group relative aspect-square overflow-hidden rounded-[14px] ring-1 ring-white/[0.08]"
            >
              <img
                src={w.src}
                alt={w.alt}
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
