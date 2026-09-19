import { LOCATIONS, BOOKING_URL, INSTAGRAM_URL, TWOGIS_URL, RATING } from '@/data';

export default function Footer() {
  return (
    <footer id="kontakty" className="border-t border-[var(--border)] pt-14 pb-10">
      <div className="wrap">
        <div className="flex flex-wrap justify-between gap-9">
          <div className="flex flex-col gap-2.5 text-sm text-[var(--muted)]">
            <div className="ftr-title">Kasym Barbershop</div>
            <span>Петропавловск, Казахстан</span>
            <span>Ежедневно 10:00—20:00</span>
          </div>
          <div className="flex flex-col gap-2.5 text-sm text-[var(--muted)]">
            <div className="ftr-title">WhatsApp</div>
            {LOCATIONS.map((l) => (
              <a key={l.name} href={l.wa} target="_blank" rel="noopener" className="hover:text-[var(--gold-soft)]">
                {l.name} — {l.phone}
              </a>
            ))}
          </div>
          <div className="flex flex-col gap-2.5 text-sm text-[var(--muted)]">
            <div className="ftr-title">Ещё</div>
            <a href={BOOKING_URL} target="_blank" rel="noopener" className="hover:text-[var(--gold-soft)]">
              Онлайн-запись
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener" className="hover:text-[var(--gold-soft)]">
              Instagram @kasym_barbershop
            </a>
            <a href={TWOGIS_URL} target="_blank" rel="noopener" className="hover:text-[var(--gold-soft)]">
              Мы в 2ГИС — {RATING.score} из 5
            </a>
          </div>
        </div>
        <div className="mt-10 text-[12.5px] tracking-[0.04em] text-[var(--muted)] opacity-70">
          © Kasym Barbershop
        </div>
      </div>
    </footer>
  );
}
