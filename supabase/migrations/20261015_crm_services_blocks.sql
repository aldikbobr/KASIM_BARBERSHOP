-- Услуга и стоимость в записи; закрытые дни и перерывы мастеров; статистика по суммам. Применено 15.10.2026.

alter table public.bookings
  add column service text not null default '' check (char_length(service) <= 80),
  add column price integer check (price is null or (price >= 0 and price <= 10000000));

-- Закрытое время мастера: time = null — весь день (выходной), иначе один слот (перерыв).
create table public.schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  location text not null check (location in ('ДСР', 'Тайга', 'Шажимбаева')),
  barber text not null check (char_length(barber) between 1 and 40),
  date date not null,
  time text check (time is null or time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  reason text not null default '' check (char_length(reason) <= 60)
);
create unique index schedule_blocks_uniq on public.schedule_blocks (location, barber, date, coalesce(time, ''));
alter table public.schedule_blocks enable row level security;

create policy "staff can read blocks" on public.schedule_blocks for select to authenticated
  using ((select private.can_branch(location)));
create policy "staff can add blocks" on public.schedule_blocks for insert to authenticated
  with check ((select private.can_branch(location)));
create policy "staff can delete blocks" on public.schedule_blocks for delete to authenticated
  using ((select private.can_branch(location)));

alter publication supabase_realtime add table public.schedule_blocks;

-- Закрыт ли слот. Нужна и сайту (через политику вставки), поэтому доступна анониму.
create or replace function private.is_blocked(p_loc text, p_barber text, p_date date, p_time text) returns boolean
  language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.schedule_blocks b
    where b.location = p_loc and b.barber = p_barber and b.date = p_date
      and (b.time is null or b.time = p_time)
  );
$$;
grant usage on schema private to anon;
grant execute on function private.is_blocked(text, text, date, text) to anon, authenticated;

-- Сайт не записывает в закрытое время и не передаёт свою услугу и стоимость.
drop policy "site can add booking" on public.bookings;
create policy "site can add booking" on public.bookings for insert to anon, authenticated
  with check (
    source = 'site' and status = 'new' and note = '' and service = '' and price is null
    and location in ('ДСР', 'Тайга', 'Шажимбаева')
    and char_length(barber) between 1 and 40
    and char_length(name) between 1 and 60
    and char_length(phone) between 6 and 25
    and time ~ '^[0-2][0-9]:[0-5][0-9]$'
    and date between current_date - 1 and current_date + 120
    and not (select private.is_blocked(location, barber, date, time))
  );

-- Занятое для сайта: записи и закрытые дни/перерывы. Весь день закрыт — все слоты заняты.
create or replace function public.busy_slots(p_location text, p_date date)
  returns table (barber text, "time" text)
  language sql stable security definer set search_path = ''
as $$
  select b.barber, b.time from public.bookings b
  where b.location = p_location and b.date = p_date
    and b.status in ('new', 'confirmed', 'done') and b.barber <> 'Любой'
  union
  select s.barber, to_char(g, 'HH24:MI')
  from public.schedule_blocks s
  cross join generate_series(timestamp '2000-01-01 10:00', timestamp '2000-01-01 19:30', interval '30 minutes') g
  where s.location = p_location and s.date = p_date and s.time is null
  union
  select s.barber, s.time from public.schedule_blocks s
  where s.location = p_location and s.date = p_date and s.time is not null;
$$;

-- Статистика: сумма по оплаченным (пришёл) услугам.
drop function public.crm_stats(date, date);
create function public.crm_stats(p_from date, p_to date)
  returns table (location text, barber text, status text, n bigint, amount bigint)
  language sql stable security invoker set search_path = ''
as $$
  select b.location, b.barber, b.status, count(*),
         coalesce(sum(b.price) filter (where b.status = 'done'), 0)::bigint
  from public.bookings b
  where b.date between p_from and p_to
  group by 1, 2, 3;
$$;
revoke all on function public.crm_stats(date, date) from public;
grant execute on function public.crm_stats(date, date) to authenticated;
