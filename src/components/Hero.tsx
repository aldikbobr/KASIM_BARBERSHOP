interface HeroProps {
  onBooking: () => void;
}

export default function Hero({ onBooking }: HeroProps) {
  const splitTitle = (text: string) =>
    text.split('').map((char, i) => (
      <span
        key={`${char}-${i}`}
        className="char-in bg-gradient-to-b from-[#f7ebc0] via-[#d4af37] to-[#8a6a2f] bg-clip-text text-transparent"
        style={{ animationDelay: `${i * 0.06}s` }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));

  return (
    <section id="top" className="relative min-h-screen overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src="/hero.jpg"
          alt="Барбершоп Kasym"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(7,7,7,0.55)] via-[rgba(7,7,7,0.5)] to-[#070707]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(7,7,7,0.75)] via-[rgba(7,7,7,0.25)] to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col justify-center">
        <div className="wrap pt-20">
          <div className="fade-in-up" style={{ animationDelay: '0.05s' }}>
            <img
              src="/crest.png"
              alt="Герб Kasym Barbershop"
              width={560}
              height={560}
              className="mb-5 w-[clamp(96px,13vw,158px)] object-contain drop-shadow-[0_0_28px_rgba(212,175,55,0.28)]"
            />
          </div>

          <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
            <p className="eyebrow">Барбершоп №1 · Петропавловск</p>
          </div>

          <h1 className="font-display text-[clamp(52px,11vw,140px)] leading-[0.95] font-medium tracking-[0.01em] uppercase">
            {splitTitle('KASYM')}
          </h1>

          <div className="fade-in-up mt-6 max-w-xl" style={{ animationDelay: '0.5s' }}>
            <p className="text-[clamp(16px,2vw,20px)] leading-relaxed text-[var(--muted)]">
              Три филиала, барберы-чемпионы,
              <br />
              ежедневно с 10:00 до 20:00
            </p>
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
