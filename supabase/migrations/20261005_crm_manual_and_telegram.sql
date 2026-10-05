-- Ручные записи администратора и уведомления в Telegram. Применено 05.10.2026.

-- Откуда запись: с сайта или добавлена администратором (звонок, пришёл без записи).
alter table public.bookings
  add column source text not null default 'site' check (source in ('site', 'admin'));

-- Сайт может создавать только записи «с сайта».
drop policy "site can add booking" on public.bookings;
create policy "site can add booking" on public.bookings for insert to anon, authenticated
  with check (
    source = 'site' and status = 'new' and note = ''
    and location in ('ДСР', 'Тайга', 'Шажимбаева')
    and char_length(barber) between 1 and 40
    and char_length(name) between 1 and 60
    and char_length(phone) between 6 and 25
    and time ~ '^[0-2][0-9]:[0-5][0-9]$'
    and date between current_date - 1 and current_date + 120
  );

-- Сотрудники добавляют записи вручную.
create policy "staff can add booking" on public.bookings for insert to authenticated
  with check ((select private.is_staff()));

-- Настройки, которые не секрет (id Telegram-группы). Схема private не видна через API.
create table if not exists private.settings (key text primary key, value text not null);

-- Уведомление в Telegram о новой заявке с сайта.
-- Токен бота — в Vault (секрет telegram_bot_token), id группы — в private.settings.
-- pg_net шлёт запрос после коммита, асинхронно: если Telegram недоступен, заявка всё равно сохранится.
create extension if not exists pg_net;

create or replace function private.notify_new_booking() returns trigger
  language plpgsql security definer set search_path = ''
as $$
declare
  token text;
  chat text;
  months text[] := array['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  msg text;
begin
  if new.source <> 'site' then return new; end if;
  select decrypted_secret into token from vault.decrypted_secrets where name = 'telegram_bot_token';
  select value into chat from private.settings where key = 'telegram_chat_id';
  if token is null or chat is null then return new; end if;

  msg := format(
    E'Новая запись с сайта\n\n%s, %s в %s\nФилиал: %s\nМастер: %s\nКлиент: %s\nТелефон: %s\n\nОткрыть CRM: https://kasim-barbershop.vercel.app/admin',
    extract(day from new.date)::int, months[extract(month from new.date)::int], new.time,
    new.location, new.barber, new.name, new.phone
  );

  perform net.http_post(
    url := 'https://api.telegram.org/bot' || token || '/sendMessage',
    body := jsonb_build_object('chat_id', chat, 'text', msg, 'disable_web_page_preview', true),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  return new;
end;
$$;

create trigger bookings_notify_telegram
  after insert on public.bookings
  for each row execute function private.notify_new_booking();
