-- Адрес CRM теперь /crm (старый /admin тоже работает). Ссылка в сообщении Telegram. Применено 14.10.2026.
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
    E'Новая запись с сайта\n\n%s, %s в %s\nФилиал: %s\nМастер: %s\nКлиент: %s\nТелефон: %s\n\nОткрыть CRM: https://kasim-barbershop.vercel.app/crm',
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
