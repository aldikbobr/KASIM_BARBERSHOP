import { SectionHead } from './SectionHead';
import { MediaGrid } from './MediaGrid';

// Фото команды и титулы — с личного сайта Касыма (репозиторий kasimm).
const TITLES = ['Чемпион Азии', 'Чемпион Европы'];

// Материалы с чемпионатов от заказчика (03.10.2026), /public/contests.
// Видео без звука, 540px по ширине; у видео рядом кадр-обложка с тем же именем.
const MEDIA = [
  { src: 'v-stage.mp4', alt: 'Мастер работает с моделью на чемпионате' },
  { src: 'p-contest.jpg', alt: 'Укладка модели во время конкурса' },
  { src: 'v-hall.mp4', alt: 'Конкурсный зал чемпионата по барберингу' },
  { src: 'v-barber.mp4', alt: 'Барбер стрижёт модель на соревновании' },
  { src: 'v-camera.mp4', alt: 'Конкурсанты за работой под камерами' },
  { src: 'v-arena.mp4', alt: 'Зал соревнований с рядами зеркал' },
];

export default function Contests() {
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

        {/* 6 плиток: 2 в ряд на телефоне, 6 на компьютере — ряды без «хвостов» */}
        <MediaGrid dir="contests" items={MEDIA} className="mt-14 lg:grid-cols-6" />
      </div>
    </section>
  );
}
