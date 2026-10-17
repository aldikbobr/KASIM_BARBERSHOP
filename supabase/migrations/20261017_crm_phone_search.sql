-- Поиск клиента по номеру: телефон хранится и в виде одних цифр, чтобы «+7 775…», «8775…» и «775 27…» находили одного клиента. Применено 17.10.2026.

alter table public.bookings
  add column phone_digits text generated always as (regexp_replace(phone, '\D', '', 'g')) stored;
