import { useCallback, useEffect, useState } from 'react';
import { createClient, type Session } from '@supabase/supabase-js';
import { Phone, MessageCircle, LogOut, Search, RefreshCw, Plus, X } from 'lucide-react';
import { LOCATIONS, TIME_SLOTS } from '@/data';
import { SUPABASE_URL, SUPABASE_KEY } from '@/lib/db';

// CRM открывается по адресу /admin. Библиотека Supabase грузится только здесь,
// основной сайт её не тянет (см. main.tsx).
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type Status = 'new' | 'confirmed' | 'done' | 'no_show' | 'cancelled';
interface Booking {
  id: string;
  created_at: string;
  location: string;
  barber: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  status: Status;
  note: string;
  source: 'site' | 'admin';
}

const STATUS: Record<Status, { label: string; cls: string }> = {
  new: { label: 'Новая', cls: 'border-amber-400/50 bg-amber-400/15 text-amber-300' },
  confirmed: { label: 'Подтверждена', cls: 'border-sky-400/50 bg-sky-400/15 text-sky-300' },
  done: { label: 'Пришёл', cls: 'border-emerald-400/50 bg-emerald-400/15 text-emerald-300' },
  no_show: { label: 'Не пришёл', cls: 'border-rose-400/50 bg-rose-400/15 text-rose-300' },
  cancelled: { label: 'Отменена', cls: 'border-white/15 bg-white/5 text-white/50' },
};

// Какие кнопки видны при каждом статусе. Из «закрытых» статусов можно вернуть запись.
const NEXT: Record<Status, Status[]> = {
  new: ['confirmed', 'cancelled'],
  confirmed: ['done', 'no_show', 'cancelled'],
  done: ['confirmed'],
  no_show: ['confirmed'],
  cancelled: ['confirmed'],
};
const BUTTON: Record<Status, string> = {
  new: '',
  confirmed: 'Подтвердить',
  done: 'Пришёл',
  no_show: 'Не пришёл',
  cancelled: 'Отменить',
};

const VIEWS = [
  { id: 'today', label: 'Сегодня' },
  { id: 'tomorrow', label: 'Завтра' },
  { id: 'week', label: '7 дней' },
  { id: 'future', label: 'Все будущие' },
  { id: 'new', label: 'Новые' },
  { id: 'past', label: 'Прошедшие' },
] as const;
type View = (typeof VIEWS)[number]['id'];

const MONTHS_OF = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayOffset = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};
const humanDate = (s: string) => {
  const d = new Date(`${s}T00:00:00`);
  const base = `${d.getDate()} ${MONTHS_OF[d.getMonth()]}`;
  if (s === dayOffset(0)) return `Сегодня, ${base}`;
  if (s === dayOffset(1)) return `Завтра, ${base}`;
  if (s === dayOffset(-1)) return `Вчера, ${base}`;
  return `${WEEKDAYS[d.getDay()]}, ${base}`;
};
// 8 707 … и +7 707 … → 77071234567 для wa.me
const waNumber = (phone: string) => {
  const d = phone.replace(/\D/g, '');
  return d.length === 11 && d.startsWith('8') ? `7${d.slice(1)}` : d.length === 10 ? `7${d}` : d;
};

// Короткий сигнал о новой заявке
function beep() {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.4);
  } catch {
    /* звук не обязателен */
  }
}

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<'list' | 'stats' | 'help'>('list');

  useEffect(() => {
    document.title = 'Qasym CRM';
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!ready) return null;
  if (!session) return <Login />;

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[rgba(7,7,7,0.92)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <div className="font-display text-[18px] tracking-[0.2em] uppercase">
            Qasym <span className="gold-text">CRM</span>
          </div>
          <nav className="flex gap-1 text-[14px]">
            {(
              [
                ['list', 'Заявки'],
                ['stats', 'Статистика'],
                ['help', 'Как пользоваться'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`rounded-lg px-3 py-1.5 ${tab === id ? 'bg-white/10 text-white' : 'text-[var(--muted)] hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </nav>
          <button
            onClick={() => supabase.auth.signOut()}
            className="ml-auto flex items-center gap-1.5 text-[13px] text-[var(--muted)] hover:text-white"
          >
            <LogOut size={15} /> Выйти
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-6">
        {tab === 'list' && <Bookings />}
        {tab === 'stats' && <Stats />}
        {tab === 'help' && <Help />}
      </main>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) setError('Неверный email или пароль');
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--card)] p-7">
        <div className="font-display text-[22px] tracking-[0.2em] uppercase">
          Qasym <span className="gold-text">CRM</span>
        </div>
        <p className="mt-1 text-[14px] text-[var(--muted)]">Вход для администраторов</p>
        <label className="mt-6 block text-[12px] tracking-[0.12em] uppercase text-[var(--muted)]" htmlFor="crm-email">
          Email
        </label>
        <input
          id="crm-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-black/30 px-4 py-3 text-[15px] focus:border-[var(--gold)] focus:outline-none"
        />
        <label className="mt-4 block text-[12px] tracking-[0.12em] uppercase text-[var(--muted)]" htmlFor="crm-pass">
          Пароль
        </label>
        <input
          id="crm-pass"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-black/30 px-4 py-3 text-[15px] focus:border-[var(--gold)] focus:outline-none"
        />
        {error && <p className="mt-3 text-[14px] text-rose-400">{error}</p>}
        <button disabled={busy} className="btn btn-gold mt-6 w-full">
          {busy ? 'Вход…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}

function Bookings() {
  const [view, setView] = useState<View>('today');
  const [branch, setBranch] = useState('all');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<Booking[]>([]);
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const s = search.replace(/[,()%*]/g, '').trim();
    let q = supabase.from('bookings').select('*');
    if (s) {
      q = q.or(`name.ilike.%${s}%,phone.ilike.%${s}%`);
    } else if (view === 'today') q = q.eq('date', dayOffset(0));
    else if (view === 'tomorrow') q = q.eq('date', dayOffset(1));
    else if (view === 'week') q = q.gte('date', dayOffset(0)).lte('date', dayOffset(6));
    else if (view === 'future') q = q.gte('date', dayOffset(0));
    else if (view === 'new') q = q.eq('status', 'new');
    else if (view === 'past') q = q.lt('date', dayOffset(0)).gte('date', dayOffset(-30));
    if (branch !== 'all') q = q.eq('location', branch);
    const desc = view === 'past' || !!s;
    const { data, error } = await q
      .order('date', { ascending: !desc })
      .order('time', { ascending: !desc })
      .limit(500);
    setLoading(false);
    if (error) {
      setError('Не удалось загрузить заявки. Проверьте интернет и нажмите «Обновить».');
      return;
    }
    setError('');
    setRows(data as Booking[]);
    const { count } = await supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'new');
    setNewCount(count ?? 0);
  }, [view, branch, search]);

  useEffect(() => {
    load();
  }, [load]);

  // Новые заявки и изменения других администраторов появляются сами.
  useEffect(() => {
    const ch = supabase
      .channel('bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (p) => {
        if (p.eventType === 'INSERT') beep();
        load();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [load]);

  useEffect(() => {
    document.title = newCount ? `(${newCount}) Qasym CRM` : 'Qasym CRM';
  }, [newCount]);

  const update = async (b: Booking, patch: Partial<Booking>) => {
    setRows((rs) => rs.map((r) => (r.id === b.id ? { ...r, ...patch } : r)));
    const { error } = await supabase.from('bookings').update(patch).eq('id', b.id);
    if (error) {
      alert('Не сохранилось, попробуйте ещё раз');
      load();
    }
  };

  // группируем по дате, чтобы был заголовок дня
  const groups: [string, Booking[]][] = [];
  for (const r of rows) {
    const last = groups[groups.length - 1];
    if (last && last[0] === r.date) last[1].push(r);
    else groups.push([r.date, [r]]);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => {
              setView(v.id);
              setSearch('');
            }}
            className={`rounded-full border px-4 py-2 text-[14px] ${
              view === v.id && !search ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-white' : 'border-[var(--border)] text-[var(--muted)] hover:text-white'
            }`}
          >
            {v.label}
            {v.id === 'new' && newCount > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 text-[12px] font-semibold text-black">{newCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="rounded-xl border border-[var(--border)] bg-black/40 px-3 py-2 text-[14px]"
          aria-label="Филиал"
        >
          <option value="all">Все филиалы</option>
          {LOCATIONS.map((l) => (
            <option key={l.name} value={l.name}>
              {l.name}
            </option>
          ))}
        </select>
        <label className="flex min-w-[200px] flex-1 items-center gap-2 rounded-xl border border-[var(--border)] bg-black/40 px-3 py-2">
          <Search size={15} className="text-[var(--muted)]" aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени или телефону"
            className="w-full bg-transparent text-[14px] focus:outline-none"
          />
        </label>
        <button onClick={load} className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-2 text-[14px] text-[var(--muted)] hover:text-white">
          <RefreshCw size={14} /> Обновить
        </button>
        <button onClick={() => setAdding(true)} className="btn btn-gold !h-10">
          <Plus size={16} /> Добавить запись
        </button>
      </div>

      {adding && (
        <AddBooking
          defaultBranch={branch === 'all' ? '' : branch}
          onClose={() => setAdding(false)}
          onSaved={() => {
            setAdding(false);
            load();
          }}
        />
      )}

      {error && <p className="mt-6 text-rose-400">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="mt-10 text-center text-[var(--muted)]">Заявок нет</p>}

      {groups.map(([date, list]) => (
        <section key={date} className="mt-7">
          <h2 className="mb-3 font-display text-[18px] tracking-[0.06em] uppercase">
            {humanDate(date)} <span className="text-[14px] text-[var(--muted)]">· {list.length}</span>
          </h2>
          <div className="flex flex-col gap-3">
            {list.map((b) => (
              <Card key={b.id} b={b} onUpdate={update} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Card({ b, onUpdate }: { b: Booking; onUpdate: (b: Booking, p: Partial<Booking>) => void }) {
  const [note, setNote] = useState(b.note);
  useEffect(() => setNote(b.note), [b.note]);
  const closed = b.status === 'done' || b.status === 'no_show' || b.status === 'cancelled';

  return (
    <article
      className={`rounded-2xl border bg-[var(--card)] p-4 sm:p-5 ${b.status === 'new' ? 'border-amber-400/40' : 'border-[var(--border)]'} ${
        b.status === 'cancelled' ? 'opacity-60' : ''
      }`}
    >
      <div className="flex flex-wrap items-start gap-x-5 gap-y-2">
        <div className="font-display text-[28px] leading-none">{b.time}</div>
        <div className="min-w-[180px] flex-1">
          <div className="text-[17px] font-medium">{b.name}</div>
          <div className="mt-0.5 text-[14px] text-[var(--muted)]">
            {b.location} · мастер: <span className="text-white/90">{b.barber}</span>
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[13px] ${STATUS[b.status].cls}`}>{STATUS[b.status].label}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {b.phone ? (
          <>
            <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-[14px] hover:border-white/30">
              <Phone size={14} /> {b.phone}
            </a>
            <a
              href={`https://wa.me/${waNumber(b.phone)}`}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-[14px] text-emerald-300 hover:border-emerald-400/50"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          </>
        ) : (
          <span className="text-[14px] text-[var(--muted)]">Телефон не указан</span>
        )}
        <div className="ml-auto flex flex-wrap gap-2">
          {NEXT[b.status].map((s) => (
            <button
              key={s}
              onClick={() => onUpdate(b, { status: s })}
              className={`rounded-lg border px-3 py-1.5 text-[14px] ${STATUS[s].cls} hover:brightness-125`}
            >
              {closed ? 'Вернуть' : BUTTON[s]}
            </button>
          ))}
        </div>
      </div>

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => note !== b.note && onUpdate(b, { note })}
        placeholder="Заметка: например, «просил фейд как в прошлый раз»"
        className="mt-3 w-full rounded-lg border border-transparent bg-black/30 px-3 py-2 text-[14px] text-white/85 placeholder:text-white/25 focus:border-[var(--border)] focus:outline-none"
      />
      <div className="mt-1.5 text-[12px] text-white/30">
        {b.source === 'admin' ? 'Добавил администратор' : 'Заявка с сайта'}:{' '}
        {new Date(b.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
      </div>
    </article>
  );
}

// Запись по телефону или клиент пришёл без записи. Время этой записи сразу
// становится занятым и на сайте.
function AddBooking({ defaultBranch, onClose, onSaved }: { defaultBranch: string; onClose: () => void; onSaved: () => void }) {
  const [branch, setBranch] = useState(defaultBranch);
  const [barber, setBarber] = useState('');
  const [date, setDate] = useState(dayOffset(0));
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [walkIn, setWalkIn] = useState(false);
  const [busy, setBusy] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const masters = LOCATIONS.find((l) => l.name === branch)?.masters ?? [];

  useEffect(() => {
    setTime('');
    if (!branch || !barber || barber === 'Любой' || !date) return setBusy([]);
    supabase.rpc('busy_slots', { p_location: branch, p_date: date }).then(({ data }) => {
      setBusy(((data ?? []) as { barber: string; time: string }[]).filter((r) => r.barber === barber).map((r) => r.time));
    });
  }, [branch, barber, date]);

  const ready = branch && barber && date && time && name.trim();

  const save = async () => {
    if (!ready) return;
    setSaving(true);
    setError('');
    const { error } = await supabase.from('bookings').insert({
      location: branch,
      barber,
      date,
      time,
      name: name.trim(),
      phone: phone.trim(),
      note: note.trim(),
      source: 'admin',
      status: walkIn ? 'done' : 'confirmed',
    });
    setSaving(false);
    if (!error) return onSaved();
    setError(error.code === '23505' ? 'Это время у мастера уже занято — выберите другое.' : 'Не сохранилось. Проверьте интернет и попробуйте ещё раз.');
  };

  const field = 'mt-1.5 w-full rounded-xl border border-[var(--border)] bg-black/40 px-3 py-2.5 text-[15px] focus:border-[var(--gold)] focus:outline-none';
  const label = 'block text-[12px] tracking-[0.1em] uppercase text-[var(--muted)]';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[#0e0e0e] p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[20px] tracking-[0.06em] uppercase">Новая запись</h2>
          <button onClick={onClose} aria-label="Закрыть" className="text-[var(--muted)] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          <div>
            <span className={label}>Филиал</span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {LOCATIONS.map((l) => (
                <button
                  key={l.name}
                  onClick={() => {
                    setBranch(l.name);
                    setBarber('');
                  }}
                  className={`rounded-lg border px-3 py-2 text-[14px] ${branch === l.name ? 'border-[var(--gold)] bg-[var(--gold)]/10' : 'border-[var(--border)] text-[var(--muted)]'}`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className={label}>
              Мастер
              <select value={barber} onChange={(e) => setBarber(e.target.value)} className={field} disabled={!branch}>
                <option value="">—</option>
                <option value="Любой">Любой</option>
                {masters.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
            <label className={label}>
              Дата
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
            </label>
          </div>

          <div>
            <span className={label}>Время</span>
            <div className="mt-1.5 grid grid-cols-5 gap-1.5">
              {TIME_SLOTS.map((s) => {
                const taken = busy.includes(s);
                return (
                  <button
                    key={s}
                    disabled={taken}
                    onClick={() => setTime(s)}
                    className={`rounded-lg border py-2 text-[13px] ${
                      taken
                        ? 'cursor-not-allowed border-transparent text-white/20 line-through'
                        : time === s
                          ? 'border-[var(--gold)] bg-[var(--gold)]/10'
                          : 'border-[var(--border)] text-[var(--muted)]'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className={label}>
              Имя клиента
              <input value={name} maxLength={60} onChange={(e) => setName(e.target.value)} className={field} />
            </label>
            <label className={label}>
              Телефон (если есть)
              <input type="tel" value={phone} maxLength={25} onChange={(e) => setPhone(e.target.value)} placeholder="+7" className={field} />
            </label>
          </div>

          <label className={label}>
            Заметка
            <input value={note} onChange={(e) => setNote(e.target.value)} className={field} />
          </label>

          <label className="flex items-center gap-2.5 text-[14px]">
            <input type="checkbox" checked={walkIn} onChange={(e) => setWalkIn(e.target.checked)} className="h-4 w-4 accent-[#d4af37]" />
            Клиент уже здесь (пришёл без записи) — сразу отметить «Пришёл»
          </label>
        </div>

        {error && <p className="mt-4 text-[14px] text-rose-400">{error}</p>}

        <div className="mt-5 flex gap-2">
          <button onClick={save} disabled={!ready || saving} className={`btn ${ready && !saving ? 'btn-gold' : 'btn-ghost opacity-40'}`}>
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </button>
          <button onClick={onClose} className="btn btn-ghost">
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

interface StatRow {
  location: string;
  barber: string;
  status: Status;
  n: number;
}

function Stats() {
  const [days, setDays] = useState(30);
  const [rows, setRows] = useState<StatRow[]>([]);

  useEffect(() => {
    supabase
      .rpc('crm_stats', { p_from: dayOffset(-(days - 1)), p_to: dayOffset(0) })
      .then(({ data }) => setRows(((data ?? []) as StatRow[]).map((r) => ({ ...r, n: Number(r.n) }))));
  }, [days]);

  const sum = (f: (r: StatRow) => boolean) => rows.filter(f).reduce((a, r) => a + r.n, 0);
  const total = sum(() => true);
  const done = sum((r) => r.status === 'done');
  const noShow = sum((r) => r.status === 'no_show');
  const cancelled = sum((r) => r.status === 'cancelled');
  const waiting = sum((r) => r.status === 'new' || r.status === 'confirmed');
  const noShowRate = done + noShow ? Math.round((noShow / (done + noShow)) * 100) : 0;

  const by = (key: 'location' | 'barber') => {
    const m = new Map<string, { total: number; done: number; noShow: number }>();
    for (const r of rows) {
      const v = m.get(r[key]) ?? { total: 0, done: 0, noShow: 0 };
      v.total += r.n;
      if (r.status === 'done') v.done += r.n;
      if (r.status === 'no_show') v.noShow += r.n;
      m.set(r[key], v);
    }
    return [...m.entries()].sort((a, b) => b[1].total - a[1].total);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {[7, 30, 90, 365].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`rounded-full border px-4 py-2 text-[14px] ${
              days === d ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-white' : 'border-[var(--border)] text-[var(--muted)] hover:text-white'
            }`}
          >
            {d === 365 ? 'Год' : `${d} дней`}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[13px] text-[var(--muted)]">Считаются записи на даты за выбранный период, включая сегодня.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        {(
          [
            ['Всего заявок', total, ''],
            ['Пришли', done, 'text-emerald-300'],
            ['Не пришли', `${noShow} · ${noShowRate}%`, 'text-rose-300'],
            ['Отменены', cancelled, 'text-white/60'],
            ['Ждут визита', waiting, 'text-amber-300'],
          ] as const
        ).map(([label, value, cls]) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div className="text-[13px] text-[var(--muted)]">{label}</div>
            <div className={`mt-1 font-display text-[28px] ${cls}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <StatTable title="По филиалам" items={by('location')} />
        <StatTable title="По мастерам" items={by('barber')} />
      </div>
    </div>
  );
}

function StatTable({ title, items }: { title: string; items: [string, { total: number; done: number; noShow: number }][] }) {
  const max = Math.max(1, ...items.map(([, v]) => v.total));
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <h3 className="mb-4 text-[12px] tracking-[0.16em] uppercase text-[var(--gold)]">{title}</h3>
      {items.length === 0 && <p className="text-[14px] text-[var(--muted)]">Пока нет данных</p>}
      <div className="flex flex-col gap-3">
        {items.map(([name, v]) => (
          <div key={name}>
            <div className="flex items-baseline justify-between gap-3 text-[14px]">
              <span>{name}</span>
              <span className="text-[var(--muted)]">
                {v.total} · <span className="text-emerald-300">{v.done} пришли</span>
                {v.noShow > 0 && <span className="text-rose-300"> · {v.noShow} нет</span>}
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-white/5">
              <div className="h-full rounded-full bg-[var(--gold)]" style={{ width: `${(v.total / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Help() {
  const steps = [
    ['Новая заявка', 'Клиент записался на сайте — заявка появляется сама, со звуком, на вкладке «Сегодня» или в «Новые», и приходит сообщением в Telegram-группу. Обычно клиент ещё и пишет в WhatsApp филиала.'],
    ['Запись по телефону', 'Клиент позвонил или написал — нажмите «Добавить запись», выберите филиал, мастера, дату и время. Это время сразу станет занятым на сайте. Пришёл без записи — поставьте галочку «Клиент уже здесь».'],
    ['Подтвердить', 'Свяжитесь с клиентом (кнопки «Телефон» и «WhatsApp» в карточке) и нажмите «Подтвердить». Если клиент передумал — «Отменить».'],
    ['После визита', 'Клиент пришёл — «Пришёл». Не пришёл и не предупредил — «Не пришёл». Это нужно для статистики.'],
    ['Ошиблись кнопкой', 'Нажмите «Вернуть» — запись снова станет подтверждённой.'],
    ['Заметки', 'В строке под заявкой можно написать что угодно: пожелания клиента, предоплата и т. п. Сохраняется само, когда вы кликнете в другое место.'],
    ['Занятое время', 'Пока заявка новая или подтверждена, это время у выбранного мастера на сайте занято — другой клиент его не выберет. Отменили заявку — время освободилось.'],
    ['Поиск', 'Найти клиента по имени или номеру телефона можно в строке поиска — ищет по всем датам.'],
  ];
  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-[22px] tracking-[0.06em] uppercase">Как пользоваться</h2>
      <ol className="mt-5 flex flex-col gap-4">
        {steps.map(([t, d], i) => (
          <li key={t} className="flex gap-4">
            <span className="font-display text-[22px] text-[var(--gold)]">{i + 1}</span>
            <div>
              <div className="text-[16px] font-medium">{t}</div>
              <p className="mt-1 text-[15px] leading-relaxed text-[var(--muted)]">{d}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
