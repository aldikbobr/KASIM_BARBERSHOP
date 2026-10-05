import { useState, useEffect, useCallback } from 'react';
import { X, Check, ChevronLeft, ChevronRight, Calendar, Clock, User, MessageCircle } from 'lucide-react';
import { LOCATIONS, MASTER_PHOTOS, TIME_SLOTS } from '@/data';
import { busySlots, saveBooking } from '@/lib/db';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
}

const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
// MONTHS — для шапки календаря («Сентябрь 2026»), MONTHS_OF — для даты («21 сентября»)
const MONTHS_OF = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Не toISOString(): он считает в UTC и в нашем поясе сдвигает дату на день назад
const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function BookingModal({ open, onClose }: BookingModalProps) {
  const [step, setStep] = useState(0);
  const [barber, setBarber] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [time, setTime] = useState<string>('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [success, setSuccess] = useState(false);
  // заявка дошла до CRM; false — база недоступна, остаётся только WhatsApp
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<Record<string, string[]>>({});
  const [timeError, setTimeError] = useState('');

  const reset = useCallback(() => {
    setStep(0);
    setBarber('');
    setLocation('');
    setSelectedDate(null);
    setCalendarMonth(new Date());
    setTime('');
    setName('');
    setPhone('');
    setSuccess(false);
    setSaved(false);
    setSaving(false);
    setBusy({});
    setTimeError('');
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

  // Занятое время подгружаем, когда клиент дошёл до выбора времени
  const dateKey = selectedDate ? isoDate(selectedDate) : '';
  useEffect(() => {
    if (!open || step !== 3 || !location || !dateKey) return;
    let alive = true;
    busySlots(location, dateKey).then((b) => alive && setBusy(b));
    return () => { alive = false; };
  }, [open, step, location, dateKey]);

  if (!open) return null;

  // Мастера выбранного филиала: список зависит от филиала, поэтому филиал — первый шаг
  const masters = LOCATIONS.find((l) => l.name === location)?.masters ?? [];

  // Слот недоступен: у мастера уже есть запись (для «Любого» — заняты все мастера)
  // или время сегодня уже прошло.
  const slotTaken = (slot: string) => {
    const takenBy = (m: string) => busy[m]?.includes(slot);
    if (barber === 'Любой' ? masters.length > 0 && masters.every(takenBy) : takenBy(barber)) return true;
    if (selectedDate && isToday(selectedDate)) {
      const now = new Date();
      const [h, m] = slot.split(':').map(Number);
      return h * 60 + m <= now.getHours() * 60 + now.getMinutes();
    }
    return false;
  };

  // Заявка пишется в CRM (Supabase) и дублируется клиентом в WhatsApp филиала.
  // База недоступна — не теряем клиента: показываем тот же WhatsApp.
  const handleSubmit = async () => {
    if (!barber || !location || !selectedDate || !time || !name || !phone) return;
    setSaving(true);
    const res = await saveBooking({ location, barber, date: isoDate(selectedDate), time, name: name.trim(), phone: phone.trim() });
    setSaving(false);
    if (res === 'taken') {
      setTime('');
      setTimeError('Это время только что заняли — выберите другое.');
      setStep(3);
      return;
    }
    setSaved(res === 'ok');
    setSuccess(true);
  };

  const canProceed = () => {
    if (step === 0) return location !== '';
    if (step === 1) return barber !== '';
    if (step === 2) return selectedDate !== null;
    if (step === 3) return time !== '' && !slotTaken(time);
    if (step === 4) return name.trim() !== '' && phone.replace(/\D/g, '').length >= 10;
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
      `Филиал: ${loc.name}, ${loc.address}`,
      `Мастер: ${barber}`,
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
            <h3 className="font-display text-2xl font-medium uppercase">{saved ? 'Заявка принята' : 'Остался один шаг'}</h3>
            <p className="max-w-sm text-[15px] leading-relaxed text-[var(--muted)]">
              {saved
                ? 'Время за вами. Администратор свяжется для подтверждения — а быстрее всего написать в WhatsApp филиала, текст уже готов.'
                : 'Нажмите кнопку — откроется WhatsApp филиала с готовым текстом. Отправьте его, и администратор подтвердит запись.'}
            </p>
            <div className="mt-2 rounded-xl border border-[var(--border)] bg-black/30 px-5 py-4 text-left text-sm">
              <div className="flex gap-2"><span className="text-[var(--muted)]">Филиал:</span><span className="text-white">{location}</span></div>
              <div className="flex gap-2"><span className="text-[var(--muted)]">Мастер:</span><span className="text-white">{barber}</span></div>
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
              {/* Step 0: Location — филиал первым: от него зависит список мастеров */}
              {step === 0 && (
                <div className="fade-in-up">
                  <div className="eyebrow">Выберите филиал</div>
                  <div className="flex flex-col gap-2">
                    {LOCATIONS.map((l) => (
                      <button
                        key={l.name}
                        aria-pressed={location === l.name}
                        onClick={() => {
                          setLocation(l.name);
                          // сменили филиал — прежний мастер в нём не работает
                          if (l.name !== location) setBarber('');
                        }}
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

              {/* Step 1: Barber — только мастера выбранного филиала */}
              {step === 1 && (
                <div className="fade-in-up">
                  <div className="eyebrow"><User size={14} /> Выберите мастера</div>
                  <div className="mb-3 text-[13px] text-[var(--muted)]">
                    Филиал: <span className="text-white">{location}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      aria-pressed={barber === 'Любой'}
                      onClick={() => setBarber('Любой')}
                      className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                        barber === 'Любой'
                          ? 'border-[var(--gold)] bg-[var(--gold)]/5 text-white'
                          : 'border-[var(--border)] text-[var(--muted)] hover:border-white/20'
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--gold)]/10 text-xs text-[var(--gold)]">★</span>
                      <span>Любой мастер</span>
                    </button>
                    {masters.map((m) => (
                      <button
                        key={m}
                        aria-pressed={barber === m}
                        onClick={() => setBarber(m)}
                        className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                          barber === m
                            ? 'border-[var(--gold)] bg-[var(--gold)]/5 text-white'
                            : 'border-[var(--border)] text-[var(--muted)] hover:border-white/20'
                        }`}
                      >
                        {MASTER_PHOTOS[m] ? (
                          <img src={MASTER_PHOTOS[m]} alt="" width={32} height={32} className="h-8 w-8 shrink-0 rounded-full object-cover" />
                        ) : (
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 font-display text-xs text-white/70">{m[0]}</span>
                        )}
                        <span className="truncate">{m}</span>
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
                  {timeError && <p className="mb-3 text-[14px] text-amber-300">{timeError}</p>}
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const taken = slotTaken(slot);
                      return (
                        <button
                          key={slot}
                          disabled={taken}
                          onClick={() => {
                            setTime(slot);
                            setTimeError('');
                          }}
                          className={`rounded-lg border py-2.5 text-sm transition-all ${
                            taken
                              ? 'cursor-not-allowed border-transparent text-white/15 line-through'
                              : time === slot
                                ? 'border-[var(--gold)] bg-[var(--gold)]/5 text-white'
                                : 'border-[var(--border)] text-[var(--muted)] hover:border-white/20 hover:text-white'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-[12px] text-[var(--muted)]">Зачёркнутое время уже занято.</p>
                </div>
              )}

              {/* Step 4: Contact */}
              {step === 4 && (
                <div className="fade-in-up">
                  <div className="eyebrow">Ваши контакты</div>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label htmlFor="booking-name" className="mb-1.5 block text-[11px] tracking-[0.12em] uppercase text-[var(--muted)]">Имя</label>
                      <input
                        id="booking-name"
                        type="text"
                        value={name}
                        maxLength={60}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Как вас зовут"
                        className="w-full rounded-xl border border-[var(--border)] bg-black/30 px-4 py-3 text-[15px] text-white placeholder:text-white/30 transition-colors focus:border-[var(--gold)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="booking-phone" className="mb-1.5 block text-[11px] tracking-[0.12em] uppercase text-[var(--muted)]">Телефон</label>
                      <input
                        id="booking-phone"
                        type="tel"
                        value={phone}
                        maxLength={25}
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
                      <div>Филиал: <span className="text-white">{location}</span></div>
                      <div>Мастер: <span className="text-white">{barber}</span></div>
                      <div>Дата: <span className="text-white">{selectedDate && formatDate(selectedDate)}</span></div>
                      <div>Время: <span className="text-white">{time}</span></div>
                    </div>
                  </div>
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
                  disabled={!canProceed() || saving}
                  className={`btn ${canProceed() && !saving ? 'btn-gold' : 'btn-ghost opacity-40'}`}
                >
                  {saving ? 'Отправляем…' : 'Записаться'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
