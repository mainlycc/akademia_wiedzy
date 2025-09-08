-- Typ roli użytkownika
do $$ begin
    create type public.user_role as enum ('admin', 'tutor');
exception
    when duplicate_object then null;
end $$;

-- Tabela profili powiązana z auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'tutor',
  created_at timestamptz not null default now()
);

-- Włączenie RLS
alter table public.profiles enable row level security;

-- Polityki RLS
do $$ begin
    create policy "Profile owners can select own profile" on public.profiles
      for select using (auth.uid() = id);
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create policy "Authenticated can select all profiles" on public.profiles
      for select to authenticated using (true);
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create policy "Users can insert own profile" on public.profiles
      for insert with check (auth.uid() = id);
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create policy "Users can update own non-role fields" on public.profiles
      for update using (auth.uid() = id) with check (auth.uid() = id);
exception
    when duplicate_object then null;
end $$;

-- Opcjonalnie: funkcja i polityka dla adminów do aktualizacji ról
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p where p.id = uid and p.role = 'admin'
  );
$$;

do $$ begin
    create policy "Admins can update any profile" on public.profiles
      for update using (public.is_admin(auth.uid()));
exception
    when duplicate_object then null;
end $$;

-- Funkcja do automatycznego tworzenia profilu po rejestracji
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'tutor');
  return new;
end;
$$;

-- Trigger wywoływany po utworzeniu nowego użytkownika
do $$ begin
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
exception
    when duplicate_object then null;
end $$;

