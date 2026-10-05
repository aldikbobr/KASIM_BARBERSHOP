import { SectionHead } from './SectionHead';
import { MediaGrid } from './MediaGrid';
import { ACHIEVEMENTS } from '@/data';

// Видео от заказчика (05.10.2026), /public/achievements: 540px, без звука, обрезаны до 10–14 с.
const MEDIA = [
  { src: 'v-team.mp4', alt: 'Команда Qasym с кубками и флагом Казахстана, вручение дипломов на сцене' },
  { src: 'v-battle.mp4', alt: 'Финальный баттл «Барбер года»' },
  { src: 'v-kasym.mp4', alt: 'Касым стрижёт модель на баттле' },
  { src: 'v-awards.mp4', alt: 'Зал чемпионата и сцена награждения с кубками' },
];

export default function Achievements() {
  return (
    <section id="dostizheniya" className="sec border-t border-[var(--border)]">
      <div className="wrap">
        <div className="grid items-start gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
          <div className="md:sticky md:top-24">
            <SectionHead
              eyebrow="Достижения"
              title={
                <>
                  Год за
                  <br />
                  <span className="gold-text">годом</span>
                </>
              }
              lead="Призовые места на чемпионатах Европы и Азии, статусы амбассадора и судьи, новые филиалы — путь Касыма Амангельдина и Qasym."
            />
          </div>

          <ol className="rv-kids border-t border-[var(--border)]">
            {ACHIEVEMENTS.map((y) => (
              <li
                key={y.year}
                className="grid gap-3 border-b border-[var(--border)] py-6 sm:grid-cols-[120px_1fr] sm:gap-6"
              >
                <span className="font-display text-[32px] leading-none font-medium tracking-[0.04em] gold-text">
                  {y.year}
                </span>
                <ul className="flex flex-col gap-2.5">
                  {y.items.map((t) => (
                    <li key={t} className="flex gap-3 text-[15px] leading-relaxed text-[var(--muted)]">
                      <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-[var(--gold)]" />
                      {t}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>

        {/* 4 плитки: 2 в ряд на телефоне, 4 на компьютере */}
        <MediaGrid dir="achievements" items={MEDIA} className="mt-14 lg:grid-cols-4" />
      </div>
    </section>
  );
}
