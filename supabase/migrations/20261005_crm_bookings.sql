-- CRM заявок (Supabase-проект «Kasym Barbershop», dpgvemgpfkzidftaqmqk). Применено 05.10.2026.
-- Старая пустая таблица от прежней версии сайта (0 строк на момент миграции).
drop table if exists public.bookings;

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  location text not null,
  barber text not null,               -- имя мастера или «Любой»
  date date not null,
  time text not null,                 -- «10:30»
  name text not null,
  phone text not null,
  status text not null default 'new'
    check (status in ('new', 'confirmed', 'done', 'no_show', 'cancelled')),
  note text not null default ''
);

create index bookings_date_idx on public.bookings (date, time);

-- Одно время у одного мастера — одна живая запись. «Любой» мастер слот не держит.
create unique index bookings_slot_uniq on public.bookings (location, barber, date, time)
  where status in ('new', 'confirmed', 'done') and barber <> 'Любой';

-- Кто может работать в CRM: email сотрудника из Supabase Auth.
create table public.staff (email text primary key);
alter table public.staff enable row level security;

create schema if not exists private;
create or replace function private.is_staff() returns boolean
  language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.staff where email = (auth.jwt() ->> 'email'));
$$;
grant usage on schema private to authenticated;
grant execute on function private.is_staff() to authenticated;

alter table public.bookings enable row level security;

-- Посетитель сайта: только добавить новую заявку, с проверкой полей.
create policy "site can add booking" on public.bookings for insert to anon, authenticated
  with check (
    status = 'new' and note = ''
    and location in ('ДСР', 'Тайга', 'Шажимбаева')
    and char_length(barber) between 1 and 40
    and char_length(name) between 1 and 60
    and char_length(phone) between 6 and 25
    and time ~ '^[0-2][0-9]:[0-5][0-9]$'
    and date between current_date - 1 and current_date + 120
  );

-- Сотрудники: видеть и менять всё. Удалять нельзя никому — только «Отменить».
create policy "staff can read" on public.bookings for select to authenticated
  using ((select private.is_staff()));
create policy "staff can update" on public.bookings for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

-- Занятые слоты для сайта: только мастер и время, без имён и телефонов.
create or replace function public.busy_slots(p_location text, p_date date)
  returns table (barber text, "time" text)
  language sql stable security definer set search_path = ''
as $$
  select b.barber, b.time from public.bookings b
  where b.location = p_location and b.date = p_date
    and b.status in ('new', 'confirmed', 'done') and b.barber <> 'Любой';
$$;
revoke all on function public.busy_slots(text, date) from public;
grant execute on function public.busy_slots(text, date) to anon, authenticated;

-- Статистика для CRM: считается под правами сотрудника, поэтому чужим вернёт пусто.
create or replace function public.crm_stats(p_from date, p_to date)
  returns table (location text, barber text, status text, n bigint)
  language sql stable security invoker set search_path = ''
as $$
  select b.location, b.barber, b.status, count(*) from public.bookings b
  where b.date between p_from and p_to
  group by 1, 2, 3;
$$;
revoke all on function public.crm_stats(date, date) from public;
grant execute on function public.crm_stats(date, date) to authenticated;

-- Новые заявки прилетают в CRM без обновления страницы.
alter publication supabase_realtime add table public.bookings;

-- Общий вход для администраторов (пароль задаёт владелец в панели Supabase).
insert into public.staff (email) values ('admin@qasym.kz');
