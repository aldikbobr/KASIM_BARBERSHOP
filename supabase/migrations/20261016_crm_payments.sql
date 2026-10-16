-- Способ оплаты и комиссии банков. Применено 16.10.2026.

alter table public.bookings
  add column payment text check (payment in ('cash', 'kaspi', 'halyk', 'card'));

-- Комиссии меняются в CRM (статистика). Доля: 0.0095 = 0,95%.
create table public.payment_rates (
  method text primary key check (method in ('cash', 'kaspi', 'halyk', 'card')),
  label text not null,
  rate numeric(6, 4) not null default 0 check (rate >= 0 and rate < 0.5)
);
insert into public.payment_rates (method, label, rate) values
  ('cash', 'Наличка', 0),
  ('kaspi', 'Каспи QR', 0.0095),
  ('halyk', 'Халык', 0.008),
  ('card', 'Карта', 0.0125);

alter table public.payment_rates enable row level security;
create policy "staff can read rates" on public.payment_rates for select to authenticated
  using ((select private.is_staff()));
create policy "staff can change rates" on public.payment_rates for update to authenticated
  using ((select private.is_staff())) with check ((select private.is_staff()));

-- Статистика теперь разбита и по способу оплаты (для фильтра и расчёта комиссии).
drop function public.crm_stats(date, date);
create function public.crm_stats(p_from date, p_to date)
  returns table (location text, barber text, status text, payment text, n bigint, amount bigint)
  language sql stable security invoker set search_path = ''
as $$
  select b.location, b.barber, b.status, b.payment, count(*),
         coalesce(sum(b.price) filter (where b.status = 'done'), 0)::bigint
  from public.bookings b
  where b.date between p_from and p_to
  group by 1, 2, 3, 4;
$$;
revoke all on function public.crm_stats(date, date) from public;
grant execute on function public.crm_stats(date, date) to authenticated;
