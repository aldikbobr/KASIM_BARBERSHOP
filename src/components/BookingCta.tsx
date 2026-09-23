interface BookingCtaProps {
  onBooking: () => void;
}

export default function BookingCta({ onBooking }: BookingCtaProps) {
  return (
    <section className="sec !pt-0">
      <div className="wrap">
        <div
          className="rv rounded-[22px] border border-[var(--gold)] border-opacity-30 bg-[var(--card)] px-10 py-10 text-center"
          style={{
            background: 'radial-gradient(70% 120% at 50% 0%, rgba(212,175,55,0.13), transparent 65%)',
          }}
        >
          <div className="eyebrow justify-center">Онлайн-запись</div>
          <h2 className="h2">
            Выберите барбера
            <br />и <span className="gold-text">удобное время</span>
          </h2>
          <p className="mx-auto mt-4 mb-8 max-w-[56ch] text-[15.5px] text-[var(--muted)]">
            Занимает минуту. Подтвердим по WhatsApp или перезвоним.
          </p>
          <button onClick={onBooking} className="btn btn-gold">
            Записаться
          </button>
        </div>
      </div>
    </section>
  );
}
