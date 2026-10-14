-- Отдельный вход на каждый филиал. Администратор видит только свой филиал, владелец (Касым) — все.
-- Применено 14.10.2026.

-- Филиал входа. У владельца пусто (видит всё). '*' — прежний общий вход admin@qasym.kz,
-- он работает, пока не созданы входы по филиалам; потом его убирают из public.staff.
alter table public.staff
  add column branch text check (branch in ('ДСР', 'Тайга', 'Шажимбаева', '*'));
update public.staff set branch = '*' where email = 'admin@qasym.kz';

-- Можно ли текущему пользователю работать с этим филиалом.
create or replace function private.can_branch(loc text) returns boolean
  language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.staff s
    where s.email = (auth.jwt() ->> 'email')
      and (s.role = 'owner' or s.branch = '*' or s.branch = loc)
  );
$$;
grant execute on function private.can_branch(text) to authenticated;

-- Заявки: читать, менять и добавлять можно только в своём филиале.
drop policy "staff can read" on public.bookings;
drop policy "staff can update" on public.bookings;
drop policy "staff can add booking" on public.bookings;

create policy "staff can read" on public.bookings for select to authenticated
  using ((select private.can_branch(location)));
create policy "staff can update" on public.bookings for update to authenticated
  using ((select private.can_branch(location))) with check ((select private.can_branch(location)));
create policy "staff can add booking" on public.bookings for insert to authenticated
  with check ((select private.can_branch(location)));

-- Роль и филиал текущего пользователя — CRM по ним решает, что показывать.
create or replace function public.crm_me() returns table (role text, branch text)
  language sql stable security definer set search_path = ''
as $$
  select s.role, s.branch from public.staff s where s.email = (auth.jwt() ->> 'email');
$$;
revoke all on function public.crm_me() from public, anon;
grant execute on function public.crm_me() to authenticated;

-- Новый пароль одному администратору. Вызвать может только владелец;
-- устройства этого администратора выходят из CRM.
drop function public.set_staff_password(text);
create or replace function public.set_staff_password(p_email text, p_password text) returns void
  language plpgsql security definer set search_path = ''
as $$
declare uid uuid;
begin
  if (select public.crm_role()) is distinct from 'owner' then
    raise exception 'Только владелец может менять пароли';
  end if;
  if char_length(p_password) < 8 then
    raise exception 'Пароль должен быть не короче 8 символов';
  end if;
  if not exists (select 1 from public.staff where email = p_email and role = 'staff') then
    raise exception 'Этот вход не входит в список администраторов';
  end if;

  update auth.users
     set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf', 10)),
         updated_at = now()
   where email = p_email
  returning id into uid;
  if uid is null then
    raise exception 'Вход для этого филиала ещё не создан в Supabase';
  end if;

  delete from auth.sessions where user_id = uid;
end;
$$;
revoke all on function public.set_staff_password(text, text) from public, anon;
grant execute on function public.set_staff_password(text, text) to authenticated;
