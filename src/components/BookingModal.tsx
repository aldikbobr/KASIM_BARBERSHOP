import { useState, useEffect, useCallback } from 'react';
import { X, Check, ChevronLeft, ChevronRight, Calendar, Clock, User, Phone, Loader2, MessageCircle } from 'lucide-react';
import { BARBERS, LOCATIONS } from '@/data';
import { supabase } from '@/lib/supabase';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
}

const TIME_SLOTS = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30',
];

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
// MONTHS — для шапки календаря («Сентябрь 2026»), MONTHS_OF — для даты («21 сентября»)
const MONTHS_OF = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export default function BookingModal({ open, onClose }: BookingModalProps) {
  const [step, setStep] = useState(0);
  const [barber, setBarber] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [time, setTime] = useState<string>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const reset = useCallback(() => {
    setStep(0);
    setBarber('');
    setLocation('');
    setSelectedDate(null);
    setCalendarMonth(new Date());
    setTime('');
    setName('');
    setPhone('');
    setSubmitting(false);
    setSuccess(false);
    setError('');
  }, []);

  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!barber || !location || !selectedDate || !time || !name || !phone) return;
    setSubmitting(true);
    setError('');

    // Не toISOString(): он считает в UTC и в нашем поясе сдвигает дату на день назад
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;

    const { error: insertError } = await supabase.from('bookings').insert({
      barber,
      location,
      date: dateStr,
      time,
      name,
      phone,
    });

    setSubmitting(false);

    if (insertError) {
      setError('Не удалось отправить заявку. Попробуйте ещё раз.');
      return;
    }

    setSuccess(true);
  };

  const canProceed = () => {
    if (step === 0) return barber !== '';
    if (step === 1) return location !== '';
    if (step === 2) return selectedDate !== null;
    if (step === 3) return time !== '';
    if (step === 4) return name.trim() !== '' && phone.trim() !== '';
    return false;
  };

  const formatDate = (d: Date) => {
    return `${d.getDate()} ${MONTHS_OF[d.getMonth()]}`;
  };

  // Заявка уходит в WhatsApp того филиала, который выбрал клиент
  const waLink = () => {
    const loc = LOCATIONS.find((l) => l.name === location);
    if (!loc || !selectedDate) return '';
    const text = [
      'Здравствуйте! Хочу записаться.',
      '',
      `Мастер: ${barber}`,
      `Филиал: ${loc.name}, ${loc.address}`,
      `Дата: ${formatDate(selectedDate)}`,
      `Время: ${time}`,
      `Имя: ${name}`,
      `Телефон: ${phone}`,
    ].join('\n');
    return `${loc.wa}?text=${encodeURIComponent(text)}`;
  };

  const getCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startWeekday = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  };

  const isToday = (d: Date) => {
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  const isPast = (d: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isSelected = (d: Date) => {
    return selectedDate?.getDate() === d.getDate() && selectedDate?.getMonth() === d.getMonth() && selectedDate?.getFullYear() === d.getFullYear();
  };

  const wa = waLink();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[#0e0e0e] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="font-display text-lg font-medium tracking-[0.06em] uppercase">
            {success ? 'Подтверждение' : 'Запись'}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center text-[var(--muted)] transition-colors hover:text-white"
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gold)]/10">
              <MessageCircle size={32} className="text-[var(--gold)]" />
            </div>
            <h3 className="font-display text-2xl font-medium uppercase">Подтвердите запись</h3>
            <p className="max-w-sm text-[15px] leading-relaxed text-[var(--muted)]">
              Нажмите кнопку — откроется WhatsApp филиала с готовым текстом, останется
              отправить. Не отправите — ничего страшного: заявку мы уже получили
              и перезвоним сами.
            </p>
            <div className="mt-2 rounded-xl border border-[var(--border)] bg-black/30 px-5 py-4 text-left text-sm">
              <div className="flex gap-2"><span className="text-[var(--muted)]">Мастер:</span><span className="text-white">{barber}</span></div>
              <div className="flex gap-2"><span className="text-[var(--muted)]">Филиал:</span><span className="text-white">{location}</span></div>
              <div className="flex gap-2"><span className="text-[var(--muted)]">Дата:</span><span className="text-white">{selectedDate && formatDate(selectedDate)}</span></div>
              <div className="flex gap-2"><span className="text-[var(--muted)]">Время:</span><span className="text-white">{time}</span></div>
            </div>
            {wa && (
              <a href={wa} target="_blank" rel="noopener" className="btn btn-gold mt-4">
                <MessageCircle size={16} /> Подтвердить в WhatsApp
              </a>
            )}
            <button onClick={onClose} className="btn btn-ghost">Закрыть</button>
          </div>
        ) : (
          <>
            {/* Progress dots */}
            <div className="flex items-center gap-1.5 px-6 pt-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    i <= step ? 'bg-[var(--gold)]' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Step 0: Barber */}
              {step === 0 && (
                <div className="fade-in-up">
                  <div className="eyebrow"><User size={14} /> Выберите мастера</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setBarber('Любой')}
                      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                        barber === 'Любой'
                          ? 'border-[var(--gold)] bg-[var(--gold)]/5 text-white'
                          : 'border-[var(--border)] text-[var(--muted)] hover:border-white/20'
                      }`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--gold)]/10 text-xs text-[var(--gold)]">★</span>
                      <span>Любой мастер</span>
                    </button>
                    {BARBERS.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setBarber(b.name)}
                        className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                          barber === b.name
                            ? 'border-[var(--gold)] bg-[var(--gold)]/5 text-white'
                            : 'border-[var(--border)] text-[var(--muted)] hover:border-white/20'
                        }`}
                      >
                        {b.image && (
                          <img src={b.image} alt="" className="h-8 w-8 rounded-full object-cover object-[center_18%]" />
                        )}
                        <span className="truncate">{b.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1: Location */}
              {step === 1 && (
                <div className="fade-in-up">
                  <div className="eyebrow">Выберите филиал</div>
                  <div className="flex flex-col gap-2">
                    {LOCATIONS.map((l) => (
                      <button
                        key={l.name}
                        onClick={() => setLocation(l.name)}
                        className={`flex items-center justify-between rounded-xl border px-5 py-4 text-left transition-all ${
                          location === l.name
                            ? 'border-[var(--gold)] bg-[var(--gold)]/5'
                            : 'border-[var(--border)] hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className={`font-display text-base tracking-[0.04em] uppercase ${location === l.name ? 'text-white' : 'text-white/80'}`}>
                            {l.name}
                          </div>
                          <div className="mt-0.5 text-[13px] text-[var(--muted)]">{l.address}</div>
                        </div>
                        {location === l.name && <Check size={18} className="text-[var(--gold)]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Date */}
              {step === 2 && (
                <div className="fade-in-up">
                  <div className="eyebrow"><Calendar size={14} /> Выберите дату</div>
                  <div className="mb-4 flex items-center justify-between">
                    <button
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition-colors hover:text-white"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="font-display text-base tracking-[0.04em] uppercase">
                      {MONTHS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                    </span>
                    <button
                      onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition-colors hover:text-white"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] tracking-[0.1em] uppercase text-[var(--muted)]">
                    {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {getCalendarDays().map((d, i) => {
                      if (!d) return <div key={i} />;
                      const past = isPast(d);
                      const selected = isSelected(d);
                      const today = isToday(d);
                      return (
                        <button
                          key={i}
                          disabled={past}
                          onClick={() => setSelectedDate(d)}
                          className={`flex h-10 items-center justify-center rounded-lg text-sm transition-all ${
                            selected
                              ? 'bg-[var(--gold)] font-medium text-black'
                              : past
                                ? 'text-white/15 cursor-not-allowed'
                                : today
                                  ? 'border border-[var(--gold)]/40 text-white hover:bg-[var(--gold)]/10'
                                  : 'text-white/70 hover:bg-white/5'
                          }`}
                        >
                          {d.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Time */}
              {step === 3 && (
                <div className="fade-in-up">
                  <div className="eyebrow"><Clock size={14} /> Выберите время</div>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setTime(slot)}
                        className={`rounded-lg border py-2.5 text-sm transition-all ${
                          time === slot
                            ? 'border-[var(--gold)] bg-[var(--gold)]/5 text-white'
                            : 'border-[var(--border)] text-[var(--muted)] hover:border-white/20 hover:text-white'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Contact */}
              {step === 4 && (
                <div className="fade-in-up">
                  <div className="eyebrow">Ваши контакты</div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="mb-1.5 block text-[11px] tracking-[0.12em] uppercase text-[var(--muted)]">Имя</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Как вас зовут"
                        className="w-full rounded-xl border border-[var(--border)] bg-black/30 px-4 py-3 text-[15px] text-white placeholder:text-white/30 transition-colors focus:border-[var(--gold)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] tracking-[0.12em] uppercase text-[var(--muted)]">Телефон</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+7 ___ ___ __ __"
                        className="w-full rounded-xl border border-[var(--border)] bg-black/30 px-4 py-3 text-[15px] text-white placeholder:text-white/30 transition-colors focus:border-[var(--gold)] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mt-5 rounded-xl border border-[var(--border)] bg-black/20 p-4">
                    <div className="text-[11px] tracking-[0.12em] uppercase text-[var(--gold)]">Ваша запись</div>
                    <div className="mt-2 space-y-1 text-sm text-[var(--muted)]">
                      <div>Мастер: <span className="text-white">{barber}</span></div>
                      <div>Филиал: <span className="text-white">{location}</span></div>
                      <div>Дата: <span className="text-white">{selectedDate && formatDate(selectedDate)}</span></div>
                      <div>Время: <span className="text-white">{time}</span></div>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 flex flex-col items-start gap-2">
                      <p className="text-[13px] text-red-400">{error}</p>
                      {wa && (
                        <a href={wa} target="_blank" rel="noopener" className="btn btn-ghost">
                          <MessageCircle size={16} /> Написать в WhatsApp
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 border-t border-[var(--border)] px-6 py-4">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="btn btn-ghost"
                >
                  <ChevronLeft size={16} /> Назад
                </button>
              )}
              {step < 4 ? (
                <button
                  onClick={() => canProceed() && setStep(step + 1)}
                  disabled={!canProceed()}
                  className={`btn ${canProceed() ? 'btn-gold' : 'btn-ghost opacity-40'}`}
                >
                  Далее <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceed() || submitting}
                  className={`btn ${canProceed() && !submitting ? 'btn-gold' : 'btn-ghost opacity-40'}`}
                >
                  {submitting ? <><Loader2 size={16} className="animate-spin" /> Отправка</> : <>Записаться</>}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
