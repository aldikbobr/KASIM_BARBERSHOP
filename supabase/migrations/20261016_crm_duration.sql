-- Длительность услуги: запись занимает все свои получасовые слоты, а не один. Применено 16.10.2026.

alter table public.bookings
  add column duration integer not null default 30 check (duration in (30, 60, 90, 120, 180));

-- Пересечения проверяет сама база, для всех: сайта, CRM, любого входа.
-- Конец записи не позже 20:00 (предположение: рабочий день до 20:00, уточнить у Касыма).
create or replace function private.check_booking_overlap() returns trigger
  language plpgsql security definer set search_path = ''
as $$
declare
  s int := split_part(new.time, ':', 1)::int * 60 + split_part(new.time, ':', 2)::int;
  e int := s + new.duration;
  hit int;
begin
  if new.status not in ('new', 'confirmed', 'done') or new.barber = 'Любой' then
    return new;
  end if;
  if e > 20 * 60 then
    raise exception 'Услуга не помещается до закрытия (20:00)' using errcode = '23514';
  end if;

  select count(*) into hit from public.bookings b
  where b.location = new.location and b.barber = new.barber and b.date = new.date and b.id <> new.id
    and b.status in ('new', 'confirmed', 'done')
    and (split_part(b.time, ':', 1)::int * 60 + split_part(b.time, ':', 2)::int) < e
    and (split_part(b.time, ':', 1)::int * 60 + split_part(b.time, ':', 2)::int) + b.duration > s;
  if hit > 0 then
    raise exception 'Время занято' using errcode = '23505';
  end if;

  select count(*) into hit from public.schedule_blocks x
  where x.location = new.location and x.barber = new.barber and x.date = new.date
    and (x.time is null or (split_part(x.time, ':', 1)::int * 60 + split_part(x.time, ':', 2)::int) between s and e - 1);
  if hit > 0 then
    raise exception 'Время закрыто' using errcode = '23505';
  end if;
  return new;
end;
$$;

create trigger bookings_overlap
  before insert or update of time, duration, barber, date, location, status on public.bookings
  for each row execute function private.check_booking_overlap();

-- Сайт: обязательно указывает услугу и длительность, стоимость не передаёт.
drop policy "site can add booking" on public.bookings;
create policy "site can add booking" on public.bookings for insert to anon, authenticated
  with check (
    source = 'site' and status = 'new' and note = '' and price is null
    and char_length(service) between 1 and 80
    and duration in (30, 60, 120)
    and location in ('ДСР', 'Тайга', 'Шажимбаева')
    and char_length(barber) between 1 and 40
    and char_length(name) between 1 and 60
    and char_length(phone) between 6 and 25
    and time ~ '^[0-2][0-9]:[0-5][0-9]$'
    and date between current_date - 1 and current_date + 120
    and not (select private.is_blocked(location, barber, date, time))
  );

-- Занятое для сайта: каждая запись — все её слоты; закрытый день и перерывы — тоже.
create or replace function public.busy_slots(p_location text, p_date date)
  returns table (barber text, "time" text)
  language sql stable security definer set search_path = ''
as $$
  select b.barber, to_char(('2000-01-01 ' || b.time)::timestamp + make_interval(mins => k * 30), 'HH24:MI')
  from public.bookings b
  cross join generate_series(0, ceil(b.duration / 30.0)::int - 1) k
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
