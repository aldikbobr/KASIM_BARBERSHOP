import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient, type Session } from '@supabase/supabase-js';
import { Phone, MessageCircle, LogOut, Search, RefreshCw, Plus, X, Download } from 'lucide-react';
import { LOCATIONS, MASTER_PHOTOS, TIME_SLOTS } from '@/data';
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
  confirmed: { label: 'Записан', cls: 'border-sky-400/50 bg-sky-400/15 text-sky-300' },
  done: { label: 'Пришёл', cls: 'border-emerald-400/50 bg-emerald-400/15 text-emerald-300' },
  no_show: { label: 'Не пришёл', cls: 'border-rose-400/50 bg-rose-400/15 text-rose-300' },
  cancelled: { label: 'Отменена', cls: 'border-white/15 bg-white/5 text-white/50' },
};

// Подтверждать не нужно: ждущая запись сразу отмечается «Пришёл» / «Не пришёл».
// Из «закрытых» статусов запись можно вернуть в ожидание.
const NEXT: Record<Status, Status[]> = {
  new: ['done', 'no_show', 'cancelled'],
  confirmed: ['done', 'no_show', 'cancelled'],
  done: ['confirmed'],
  no_show: ['confirmed'],
  cancelled: ['confirmed'],
};
const BUTTON: Record<Status, string> = {
  new: '',
  confirmed: 'Вернуть',
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

// Перезагрузить данные при любом изменении заявок (новая с сайта, правка другого администратора).
function useLiveReload(name: string, reload: () => void) {
  useEffect(() => {
    const ch = supabase
      .channel(name)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => reload())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [name, reload]);
}

// Общий стиль переключателей; на телефоне мельче
const chip = (active: boolean) =>
  `shrink-0 rounded-full border px-3 py-1.5 text-[13px] sm:px-4 sm:py-2 sm:text-[14px] ${
    active ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-white' : 'border-[var(--border)] text-[var(--muted)] hover:text-white'
  }`;

async function patchBooking(id: string, patch: Partial<Booking>) {
  const { error } = await supabase.from('bookings').update(patch).eq('id', id);
  if (error) alert('Не сохранилось, попробуйте ещё раз');
  return !error;
}

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

// Что подставить в форму «Добавить запись» (из расписания — мастер, дата и время).
interface AddInit {
  branch?: string;
  barber?: string;
  date?: string;
  time?: string;
}

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<'schedule' | 'list' | 'stats' | 'help'>('schedule');
  const [newCount, setNewCount] = useState(0);
  const [addInit, setAddInit] = useState<AddInit | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  // Число новых заявок и звук — на любой вкладке.
  useEffect(() => {
    if (!session) return;
    const refresh = () =>
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new')
        .then(({ count }) => setNewCount(count ?? 0));
    refresh();
    const ch = supabase
      .channel('crm-new')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (p) => {
        if (p.eventType === 'INSERT' && (p.new as Booking).source === 'site') beep();
        refresh();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [session]);

  useEffect(() => {
    document.title = newCount ? `(${newCount}) Qasym CRM` : 'Qasym CRM';
  }, [newCount]);

  if (!ready) return null;
  if (!session) return <Login />;

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[rgba(7,7,7,0.92)] backdrop-blur">
        {/* На телефоне: логотип и «Выйти» в первой строке, вкладки во второй */}
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-1.5 px-4 py-2 sm:py-3">
          <div className="font-display text-[16px] tracking-[0.2em] uppercase sm:text-[18px]">
            Qasym <span className="gold-text">CRM</span>
          </div>
          <nav className="order-last -mx-1.5 flex w-full gap-0.5 text-[13px] min-[400px]:text-[14px] sm:order-none sm:mx-0 sm:w-auto sm:gap-1">
            {(
              [
                ['schedule', 'Расписание'],
                ['list', 'Заявки'],
                ['stats', 'Статистика'],
                ['help', 'Помощь'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`shrink-0 rounded-lg px-1.5 py-1.5 min-[400px]:px-2.5 sm:px-3 ${tab === id ? 'bg-white/10 text-white' : 'text-[var(--muted)] hover:text-white'}`}
              >
                {label}
                {id === 'list' && newCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 text-[12px] font-semibold text-black">{newCount}</span>
                )}
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

      <main className="mx-auto max-w-5xl px-4 pt-4 sm:pt-6">
        {tab === 'schedule' && <Schedule onAdd={setAddInit} />}
        {tab === 'list' && <Bookings newCount={newCount} onAdd={setAddInit} />}
        {tab === 'stats' && <Stats />}
        {tab === 'help' && <Help />}
      </main>

      {addInit && <AddBooking init={addInit} onClose={() => setAddInit(null)} onSaved={() => setAddInit(null)} />}
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
          className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-black/30 px-4 py-3 text-[16px] focus:border-[var(--gold)] focus:outline-none"
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
          className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-black/30 px-4 py-3 text-[16px] focus:border-[var(--gold)] focus:outline-none"
        />
        {error && <p className="mt-3 text-[14px] text-rose-400">{error}</p>}
        <button disabled={busy} className="btn btn-gold mt-6 w-full">
          {busy ? 'Вход…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}

function Bookings({ newCount, onAdd }: { newCount: number; onAdd: (init: AddInit) => void }) {
  const [view, setView] = useState<View>('today');
  const [branch, setBranch] = useState('all');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [master, setMaster] = useState(''); // '' — все мастера

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
  }, [view, branch, search]);

  useEffect(() => {
    load();
  }, [load]);

  // Новые заявки и изменения других администраторов появляются сами.
  useLiveReload('bookings-list', load);

  const update = async (b: Booking, patch: Partial<Booking>) => {
    setRows((rs) => rs.map((r) => (r.id === b.id ? { ...r, ...patch } : r)));
    if (!(await patchBooking(b.id, patch))) load();
  };

  // Вкладки мастеров: мастера выбранного филиала (или всех), плюс «Любой», если такие заявки есть.
  // Фильтр по мастеру — на месте, поэтому на каждой вкладке видно число записей.
  const masterTabs = [
    ...(branch === 'all' ? LOCATIONS.flatMap((l) => l.masters) : (LOCATIONS.find((l) => l.name === branch)?.masters ?? [])),
    ...(rows.some((r) => r.barber === 'Любой') ? ['Любой'] : []),
  ];
  const countBy = (m: string) => rows.filter((r) => r.barber === m).length;
  const shown = master ? rows.filter((r) => r.barber === master) : rows;

  // группируем по дате, чтобы был заголовок дня
  const groups: [string, Booking[]][] = [];
  for (const r of shown) {
    const last = groups[groups.length - 1];
    if (last && last[0] === r.date) last[1].push(r);
    else groups.push([r.date, [r]]);
  }

  return (
    <div>
      {/* На телефоне ряды не переносятся, а листаются вбок */}
      <div className="no-sb -mx-4 flex gap-2 overflow-x-auto px-4 sm:flex-wrap">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => {
              setView(v.id);
              setSearch('');
            }}
            className={chip(view === v.id && !search)}
          >
            {v.label}
            {v.id === 'new' && newCount > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 text-[12px] font-semibold text-black">{newCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="flex w-full items-center gap-2 rounded-xl border border-[var(--border)] bg-black/40 px-3 py-2 sm:order-1 sm:w-auto sm:min-w-[200px] sm:flex-1">
          <Search size={15} className="text-[var(--muted)]" aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени или телефону"
            className="w-full bg-transparent text-[16px] focus:outline-none sm:text-[14px]"
          />
        </label>
        <select
          value={branch}
          onChange={(e) => {
            setBranch(e.target.value);
            setMaster('');
          }}
          className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-black/40 px-3 py-2 text-[16px] sm:flex-none sm:text-[14px]"
          aria-label="Филиал"
        >
          <option value="all">Все филиалы</option>
          {LOCATIONS.map((l) => (
            <option key={l.name} value={l.name}>
              {l.name}
            </option>
          ))}
        </select>
        <button onClick={load} aria-label="Обновить" className="flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-2.5 text-[14px] text-[var(--muted)] hover:text-white sm:order-2 sm:py-2">
          <RefreshCw size={14} /> <span className="hidden sm:inline">Обновить</span>
        </button>
        <button onClick={() => onAdd({ branch: branch === 'all' ? '' : branch })} className="btn btn-gold !h-10 !px-4 sm:order-3 sm:!px-[22px]">
          <Plus size={16} /> Записать
        </button>
      </div>

      <div className="no-sb -mx-4 mt-3 flex gap-2 overflow-x-auto px-4" role="tablist" aria-label="Мастера">
        {['', ...masterTabs].map((m) => {
          const active = master === m;
          const n = m ? countBy(m) : rows.length;
          return (
            <button
              key={m || 'all'}
              role="tab"
              aria-selected={active}
              onClick={() => setMaster(m)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-2.5 text-[13px] sm:gap-2 sm:py-1 sm:pl-1 sm:pr-3 sm:text-[14px] ${
                active ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-white' : 'border-[var(--border)] text-[var(--muted)] hover:text-white'
              } ${!m ? '!pl-3' : ''}`}
            >
              {m && MASTER_PHOTOS[m] && <img src={MASTER_PHOTOS[m]} alt="" className="h-6 w-6 rounded-full object-cover sm:h-7 sm:w-7" />}
              {m || 'Все мастера'}
              <span className={`text-[12px] ${n ? 'text-[var(--gold-soft)]' : 'opacity-40'}`}>{n}</span>
            </button>
          );
        })}
      </div>

      {error && <p className="mt-6 text-rose-400">{error}</p>}
      {!loading && !error && shown.length === 0 && (
        <p className="mt-10 text-center text-[var(--muted)]">{master ? `У мастера ${master} записей нет` : 'Заявок нет'}</p>
      )}

      {groups.map(([date, list]) => (
        <section key={date} className="mt-5 sm:mt-7">
          <h2 className="mb-2 font-display text-[16px] tracking-[0.06em] uppercase sm:mb-3 sm:text-[18px]">
            {humanDate(date)} <span className="text-[14px] text-[var(--muted)]">· {list.length}</span>
          </h2>
          <div className="flex flex-col gap-2 sm:gap-3">
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

  return (
    <article
      className={`rounded-2xl border bg-[var(--card)] p-3 sm:p-5 ${b.status === 'new' ? 'border-amber-400/40' : 'border-[var(--border)]'} ${
        b.status === 'cancelled' ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-5">
        <div className="font-display text-[22px] leading-none sm:text-[28px]">{b.time}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[16px] font-medium sm:text-[17px]">{b.name}</div>
          <div className="mt-0.5 text-[13px] text-[var(--muted)] sm:text-[14px]">
            {b.location} · мастер: <span className="text-white/90">{b.barber}</span>
          </div>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[12px] sm:px-3 sm:py-1 sm:text-[13px] ${STATUS[b.status].cls}`}>{STATUS[b.status].label}</span>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2 sm:mt-3">
        {b.phone ? (
          <>
            <a href={`tel:${b.phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[13px] hover:border-white/30 sm:px-3 sm:text-[14px]">
              <Phone size={14} /> {b.phone}
            </a>
            <a
              href={`https://wa.me/${waNumber(b.phone)}`}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[13px] text-emerald-300 hover:border-emerald-400/50 sm:px-3 sm:text-[14px]"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          </>
        ) : (
          <span className="text-[13px] text-[var(--muted)] sm:text-[14px]">Телефон не указан</span>
        )}
        {/* На телефоне кнопки статуса — отдельной строкой, «Пришёл» и «Не пришёл» на всю ширину */}
        <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
          {NEXT[b.status].map((s) => (
            <button
              key={s}
              onClick={() => onUpdate(b, { status: s })}
              className={`rounded-lg border px-3 py-2 text-[14px] sm:py-1.5 ${STATUS[s].cls} hover:brightness-125 ${
                s === 'done' || s === 'no_show' ? 'flex-1 font-medium sm:flex-none' : ''
              }`}
            >
              {BUTTON[s]}
            </button>
          ))}
        </div>
      </div>

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => note !== b.note && onUpdate(b, { note })}
        placeholder="Заметка: пожелания, предоплата…"
        className="mt-2.5 w-full rounded-lg border border-transparent bg-black/30 px-3 py-1.5 text-[16px] text-white/85 placeholder:text-white/25 focus:border-[var(--border)] focus:outline-none sm:mt-3 sm:py-2 sm:text-[14px]"
      />
      <div className="mt-1 text-[11px] text-white/30 sm:mt-1.5 sm:text-[12px]">
        {b.source === 'admin' ? 'Добавил администратор' : 'Заявка с сайта'}:{' '}
        {new Date(b.created_at).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
      </div>
    </article>
  );
}

const CELL: Record<string, string> = {
  new: 'border-amber-400/50 bg-amber-400/15 text-amber-100',
  confirmed: 'border-sky-400/50 bg-sky-400/15 text-sky-100',
  done: 'border-emerald-400/50 bg-emerald-400/15 text-emerald-100',
};

// Сетка дня по филиалу: мастера × время. Сразу видно, у кого когда свободно;
// нажать на свободную ячейку — открыть запись с этим мастером и временем.
function Schedule({ onAdd }: { onAdd: (init: AddInit) => void }) {
  const [branch, setBranch] = useState(LOCATIONS[0].name);
  const [date, setDate] = useState(dayOffset(0));
  const [rows, setRows] = useState<Booking[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [open, setOpen] = useState<Booking | null>(null); // карточка занятой ячейки

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('location', branch)
      .eq('date', date)
      .in('status', ['new', 'confirmed', 'done']);
    setRows((data ?? []) as Booking[]);
  }, [branch, date]);

  useEffect(() => {
    load();
  }, [load]);
  useLiveReload('schedule', load);

  // прошедшее время гаснет само
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const masters = LOCATIONS.find((l) => l.name === branch)?.masters ?? [];
  // «Любой мастер» — заявки без мастера: показываем отдельной колонкой, чтобы их распределили
  const cols = [...masters, ...(rows.some((r) => r.barber === 'Любой') ? ['Любой'] : [])];
  const at = (m: string, t: string) => rows.filter((r) => r.barber === m && r.time === t);
  const isPast = (t: string) => {
    if (date < dayOffset(0)) return true;
    if (date > dayOffset(0)) return false;
    const [h, mm] = t.split(':').map(Number);
    return h * 60 + mm <= now.getHours() * 60 + now.getMinutes();
  };
  const freeCount = (m: string) => TIME_SLOTS.filter((t) => !isPast(t) && at(m, t).length === 0).length;
  // прошедшее время без записей не показываем — оно только занимает место
  const slots = TIME_SLOTS.filter((t) => !isPast(t) || cols.some((m) => at(m, t).length));
  const shift = (n: number) => {
    const d = new Date(`${date}T00:00:00`);
    d.setDate(d.getDate() + n);
    setDate(iso(d));
  };
  const arrow = 'rounded-full border border-[var(--border)] px-3 py-1.5 text-[14px] text-[var(--muted)] hover:text-white sm:py-2';

  return (
    <div>
      <div className="flex gap-2 sm:flex-wrap">
        {LOCATIONS.map((l) => (
          <button key={l.name} onClick={() => setBranch(l.name)} className={chip(branch === l.name)}>
            {l.name}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={() => shift(-1)} aria-label="Предыдущий день" className={arrow}>
          ‹
        </button>
        <div className="min-w-[150px] flex-1 text-center font-display text-[16px] tracking-[0.04em] uppercase sm:min-w-[170px] sm:flex-none sm:text-[18px]">{humanDate(date)}</div>
        <button onClick={() => shift(1)} aria-label="Следующий день" className={arrow}>
          ›
        </button>
        <button onClick={() => setDate(dayOffset(0))} className={chip(date === dayOffset(0))}>
          Сегодня
        </button>
        <button onClick={() => setDate(dayOffset(1))} className={chip(date === dayOffset(1))}>
          Завтра
        </button>
        <input
          type="date"
          value={date}
          onChange={(e) => e.target.value && setDate(e.target.value)}
          aria-label="Выбрать дату"
          className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-black/40 px-3 py-1.5 text-[16px] sm:flex-none sm:py-2 sm:text-[14px]"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[var(--muted)] sm:text-[13px]">
        <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded border border-dashed border-white/25" /> свободно — нажмите, чтобы записать</span>
        <span className="flex items-center gap-1.5"><i className={`h-3 w-3 rounded border ${CELL.new}`} /> новая с сайта</span>
        <span className="flex items-center gap-1.5"><i className={`h-3 w-3 rounded border ${CELL.confirmed}`} /> записан</span>
        <span className="flex items-center gap-1.5"><i className={`h-3 w-3 rounded border ${CELL.done}`} /> пришёл</span>
      </div>

      {/* Широкая сетка листается вбок, колонка со временем стоит на месте */}
      <div className="-mx-4 mt-3 overflow-x-auto px-4 pb-2 sm:mt-4">
        <table className="border-separate border-spacing-1 text-[12px] sm:text-[13px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-[#0b0806]" />
              {cols.map((m) => (
                <th key={m} className="min-w-[76px] px-0.5 pb-1.5 align-bottom font-normal sm:min-w-[104px] sm:px-1 sm:pb-2">
                  <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                    {MASTER_PHOTOS[m] ? (
                      <img src={MASTER_PHOTOS[m]} alt="" className="h-7 w-7 rounded-full object-cover sm:h-9 sm:w-9" />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-[var(--gold)] sm:h-9 sm:w-9">★</span>
                    )}
                    <span className="text-[13px] text-white sm:text-[14px]">{m}</span>
                    {m !== 'Любой' && (
                      <span className={`text-[11px] sm:text-[12px] ${freeCount(m) ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {freeCount(m) ? `свободно ${freeCount(m)}` : 'всё занято'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((t) => {
              const past = isPast(t);
              return (
                <tr key={t}>
                  <th className={`sticky left-0 z-10 bg-[#0b0806] pr-1.5 text-right font-display text-[13px] font-normal sm:pr-2 sm:text-[15px] ${past ? 'text-white/25' : 'text-white/80'}`}>{t}</th>
                  {cols.map((m) => {
                    const list = at(m, t);
                    if (list.length) {
                      const b = list[0];
                      return (
                        <td key={m} className="h-9 p-0 sm:h-11">
                          <button
                            onClick={() => setOpen(b)}
                            title={`${b.name}${b.phone ? ` · ${b.phone}` : ''} · ${STATUS[b.status].label}`}
                            className={`h-full w-full rounded-lg border px-1.5 text-left sm:px-2 ${CELL[b.status]} ${past ? 'opacity-50' : ''}`}
                          >
                            <div className="max-w-[72px] truncate sm:max-w-[110px]">{b.name}</div>
                            {list.length > 1 && <div className="text-[11px] opacity-70">+ ещё {list.length - 1}</div>}
                          </button>
                        </td>
                      );
                    }
                    if (past || m === 'Любой') return <td key={m} className="h-9 rounded-lg bg-white/[0.02] sm:h-11" />;
                    return (
                      <td key={m} className="h-9 p-0 sm:h-11">
                        <button
                          onClick={() => onAdd({ branch, barber: m, date, time: t })}
                          aria-label={`Записать к ${m} на ${t}`}
                          className="h-full w-full rounded-lg border border-dashed border-white/15 text-[11px] text-white/30 transition-colors hover:border-[var(--gold)] hover:bg-[var(--gold)]/10 hover:text-[var(--gold-soft)] sm:text-[12px]"
                        >
                          свободно
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {slots.length === 0 && <p className="mt-4 text-center text-[var(--muted)]">В этот день записей не было</p>}
      </div>

      {/* Карточка клиента прямо из расписания: позвонить, отметить «Пришёл» / «Не пришёл» */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-3 sm:items-center" onClick={() => setOpen(null)}>
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(null)} aria-label="Закрыть" className="mb-2 ml-auto flex items-center gap-1 text-[14px] text-[var(--muted)] hover:text-white">
              <X size={18} /> Закрыть
            </button>
            <Card
              b={open}
              onUpdate={async (b, patch) => {
                setOpen(patch.status ? null : { ...b, ...patch });
                await patchBooking(b.id, patch);
                load();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Запись по телефону или клиент пришёл без записи. Время этой записи сразу
// становится занятым и на сайте.
function AddBooking({ init, onClose, onSaved }: { init: AddInit; onClose: () => void; onSaved: () => void }) {
  const [branch, setBranch] = useState(init.branch ?? '');
  const [barber, setBarber] = useState(init.barber ?? '');
  const [date, setDate] = useState(init.date ?? dayOffset(0));
  const [time, setTime] = useState(init.time ?? '');
  const pickedFor = useRef(`${branch}|${barber}|${date}`);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [walkIn, setWalkIn] = useState(false);
  const [busy, setBusy] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const masters = LOCATIONS.find((l) => l.name === branch)?.masters ?? [];

  useEffect(() => {
    // сменили филиал, мастера или дату — выбранное время больше не актуально
    const key = `${branch}|${barber}|${date}`;
    if (pickedFor.current !== key) {
      pickedFor.current = key;
      setTime('');
    }
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

  // 16px на телефоне — иначе iPhone приближает страницу при вводе
  const field = 'mt-1.5 w-full rounded-xl border border-[var(--border)] bg-black/40 px-3 py-2 text-[16px] focus:border-[var(--gold)] focus:outline-none sm:py-2.5 sm:text-[15px]';
  const label = 'block text-[11px] tracking-[0.1em] uppercase text-[var(--muted)] sm:text-[12px]';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-2 sm:items-center sm:p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[#0e0e0e] p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[20px] tracking-[0.06em] uppercase">Новая запись</h2>
          <button onClick={onClose} aria-label="Закрыть" className="text-[var(--muted)] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4">
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
                    className={`rounded-lg border py-1.5 text-[13px] sm:py-2 ${
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

          <div className="grid grid-cols-2 items-end gap-3">
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

        <div className="mt-4 flex gap-2 sm:mt-5">
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

// 2026-10-05 → 05.10.2026
const ru = (s: string) => s.split('-').reverse().join('.');

function Stats() {
  const [from, setFrom] = useState(dayOffset(-29));
  const [to, setTo] = useState(dayOffset(0));
  const [rows, setRows] = useState<StatRow[]>([]);

  useEffect(() => {
    if (!from || !to) return;
    supabase
      .rpc('crm_stats', { p_from: from, p_to: to })
      .then(({ data }) => setRows(((data ?? []) as StatRow[]).map((r) => ({ ...r, n: Number(r.n) }))));
  }, [from, to]);

  const sum = (f: (r: StatRow) => boolean) => rows.filter(f).reduce((a, r) => a + r.n, 0);
  const total = sum(() => true);
  const done = sum((r) => r.status === 'done');
  const noShow = sum((r) => r.status === 'no_show');
  const cancelled = sum((r) => r.status === 'cancelled');
  const waiting = sum((r) => r.status === 'new' || r.status === 'confirmed');
  const noShowRate = done + noShow ? Math.round((noShow / (done + noShow)) * 100) : 0;

  const by = (key: 'location' | 'barber') => {
    const m = new Map<string, { total: number; done: number; noShow: number; cancelled: number }>();
    for (const r of rows) {
      const v = m.get(r[key]) ?? { total: 0, done: 0, noShow: 0, cancelled: 0 };
      v.total += r.n;
      if (r.status === 'done') v.done += r.n;
      if (r.status === 'no_show') v.noShow += r.n;
      if (r.status === 'cancelled') v.cancelled += r.n;
      m.set(r[key], v);
    }
    return [...m.entries()].sort((a, b) => b[1].total - a[1].total);
  };

  // CSV с «;» и BOM — так его правильно открывает русский Excel
  const download = () => {
    const table = (title: string, items: ReturnType<typeof by>) => [
      [title, 'Всего', 'Пришли', 'Не пришли', 'Отменены'],
      ...items.map(([n, v]) => [n, v.total, v.done, v.noShow, v.cancelled]),
      [],
    ];
    const lines: (string | number)[][] = [
      ['Qasym — статистика записей', `${ru(from)} – ${ru(to)}`],
      [],
      ['Всего заявок', total],
      ['Пришли', done],
      ['Не пришли', noShow],
      ['Не пришли, %', noShowRate],
      ['Отменены', cancelled],
      ['Ждут визита', waiting],
      [],
      ...table('Филиал', by('location')),
      ...table('Мастер', by('barber')),
    ];
    const csv = '﻿' + lines.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `qasym-statistika_${from}_${to}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  return (
    <div>
      <div className="no-sb -mx-4 flex gap-2 overflow-x-auto px-4 sm:flex-wrap">
        {[1, 7, 30, 90, 365].map((d) => (
          <button
            key={d}
            onClick={() => {
              setFrom(dayOffset(-(d - 1)));
              setTo(dayOffset(0));
            }}
            className={chip(from === dayOffset(-(d - 1)) && to === dayOffset(0))}
          >
            {d === 1 ? 'Сегодня' : d === 365 ? 'Год' : `${d} дней`}
          </button>
        ))}
      </div>

      {/* Свой период: например, с 3 по 5 число */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[14px] text-[var(--muted)]">
        <label className="flex min-w-0 flex-1 items-center gap-1.5 sm:flex-none">
          с
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => e.target.value && setFrom(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-black/40 px-3 py-1.5 text-[16px] text-white sm:py-2 sm:text-[14px]"
          />
        </label>
        <label className="flex min-w-0 flex-1 items-center gap-1.5 sm:flex-none">
          по
          <input
            type="date"
            value={to}
            min={from}
            onChange={(e) => e.target.value && setTo(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-black/40 px-3 py-1.5 text-[16px] text-white sm:py-2 sm:text-[14px]"
          />
        </label>
        <button onClick={download} className="btn btn-ghost !h-10 w-full !px-4 sm:ml-auto sm:w-auto">
          <Download size={16} /> Скачать (Excel)
        </button>
      </div>
      <p className="mt-2 text-[13px] text-[var(--muted)]">Считаются записи на даты с {ru(from)} по {ru(to)} включительно.</p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3 md:grid-cols-5">
        {(
          [
            ['Всего заявок', total, ''],
            ['Пришли', done, 'text-emerald-300'],
            ['Не пришли', `${noShow} · ${noShowRate}%`, 'text-rose-300'],
            ['Отменены', cancelled, 'text-white/60'],
            ['Ждут визита', waiting, 'text-amber-300'],
          ] as const
        ).map(([label, value, cls]) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 sm:p-4">
            <div className="text-[13px] text-[var(--muted)]">{label}</div>
            <div className={`mt-1 font-display text-[24px] sm:text-[28px] ${cls}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:mt-6 sm:gap-4 md:grid-cols-2">
        <StatTable title="По филиалам" items={by('location')} />
        <StatTable title="По мастерам" items={by('barber')} />
      </div>
    </div>
  );
}

function StatTable({ title, items }: { title: string; items: [string, { total: number; done: number; noShow: number }][] }) {
  const max = Math.max(1, ...items.map(([, v]) => v.total));
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
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
    ['Расписание', 'Первая вкладка. Выберите филиал и день — видно всех мастеров и всё время: цветные ячейки заняты (нажмите, чтобы открыть клиента), «свободно» — можно записывать. Под каждым мастером написано, сколько у него свободных окошек. Нажмите «свободно» — откроется запись с этим мастером и временем.'],
    ['Новая заявка', 'Клиент записался на сайте — заявка появляется сама, со звуком, и приходит сообщением в Telegram-группу. Подтверждать её не нужно. Если хотите, напомните клиенту о визите кнопками «Телефон» или «WhatsApp» в карточке.'],
    ['Запись по телефону', 'Клиент позвонил или написал — нажмите «Записать», выберите филиал, мастера, дату и время. Это время сразу станет занятым на сайте. Пришёл без записи — поставьте галочку «Клиент уже здесь».'],
    ['Отметить визит', 'Клиент пришёл — нажмите «Пришёл». Не пришёл и не предупредил — «Не пришёл». Это можно сделать в «Заявках» или прямо в расписании. Нужно для статистики.'],
    ['Клиент передумал', 'Нажмите «Отменить» — время освободится, на него снова можно записать.'],
    ['Ошиблись кнопкой', 'Нажмите «Вернуть» — запись снова станет ожидающей.'],
    ['Заметки', 'В строке под заявкой можно написать что угодно: пожелания клиента, предоплата и т. п. Сохраняется само, когда вы нажмёте в другое место.'],
    ['Статистика', 'Выберите период кнопками или поставьте свои даты «с … по …». «Скачать (Excel)» сохраняет цифры файлом.'],
    ['Поиск', 'Найти клиента по имени или номеру телефона можно в строке поиска на вкладке «Заявки» — ищет по всем датам.'],
  ];
  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-[20px] tracking-[0.06em] uppercase sm:text-[22px]">Как пользоваться</h2>
      <ol className="mt-4 flex flex-col gap-4 sm:mt-5">
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
