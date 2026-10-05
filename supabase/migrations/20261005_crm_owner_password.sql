-- Восстановление пароля: только владелец (Касым) задаёт новый пароль общего входа сотрудников. Применено 05.10.2026.

-- Роль в CRM: staff — общий вход администраторов, owner — личный вход Касыма.
alter table public.staff
  add column role text not null default 'staff' check (role in ('staff', 'owner'));

-- Роль текущего пользователя — чтобы CRM показала владельцу вкладку «Пароли».
create or replace function public.crm_role() returns text
  language sql stable security definer set search_path = ''
as $$
  select role from public.staff where email = (auth.jwt() ->> 'email');
$$;
revoke all on function public.crm_role() from public;
grant execute on function public.crm_role() to authenticated;

-- Новый пароль для всех входов с ролью staff. Вызвать может только owner.
-- Заодно все устройства сотрудников выходят из CRM (уволенный не останется внутри).
create or replace function public.set_staff_password(p_password text) returns void
  language plpgsql security definer set search_path = ''
as $$
begin
  if (select public.crm_role()) is distinct from 'owner' then
    raise exception 'Только владелец может менять пароль сотрудников';
  end if;
  if char_length(p_password) < 8 then
    raise exception 'Пароль должен быть не короче 8 символов';
  end if;

  update auth.users
     set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf', 10)),
         updated_at = now()
   where email in (select email from public.staff where role = 'staff');

  delete from auth.sessions
   where user_id in (select u.id from auth.users u join public.staff s on s.email = u.email where s.role = 'staff');
end;
$$;
revoke all on function public.set_staff_password(text) from public;
grant execute on function public.set_staff_password(text) to authenticated;

-- Supabase по умолчанию даёт anon право вызывать новые функции — убираем.
revoke execute on function public.crm_role() from anon;
revoke execute on function public.set_staff_password(text) from anon;

-- Владелец добавляется после того, как его вход создан в панели Supabase:
-- insert into public.staff (email, role) values ('<почта Касыма>', 'owner');
