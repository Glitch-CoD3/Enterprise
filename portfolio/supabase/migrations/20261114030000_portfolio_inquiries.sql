create table if not exists public.portfolio_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 80),
  email text not null check (
    char_length(email) between 3 and 254
    and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  ),
  access_token text not null unique check (access_token ~ '^[A-Za-z0-9_-]{43}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

create table if not exists public.portfolio_inquiry_messages (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.portfolio_inquiries (id) on delete cascade,
  sender text not null check (sender in ('visitor', 'admin')),
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index if not exists portfolio_inquiries_created_at_idx
  on public.portfolio_inquiries (created_at desc);
create index if not exists portfolio_inquiry_messages_inquiry_created_at_idx
  on public.portfolio_inquiry_messages (inquiry_id, created_at);

alter table public.portfolio_inquiries enable row level security;
alter table public.portfolio_inquiry_messages enable row level security;

drop policy if exists "Portfolio admins can read inquiries" on public.portfolio_inquiries;
create policy "Portfolio admins can read inquiries"
on public.portfolio_inquiries for select to authenticated
using ((select public.is_portfolio_admin()));

drop policy if exists "Portfolio admins can read inquiry messages" on public.portfolio_inquiry_messages;
create policy "Portfolio admins can read inquiry messages"
on public.portfolio_inquiry_messages for select to authenticated
using ((select public.is_portfolio_admin()));

revoke all on table public.portfolio_inquiries, public.portfolio_inquiry_messages
  from public, anon, authenticated;
grant select on public.portfolio_inquiries, public.portfolio_inquiry_messages
  to authenticated;

create or replace function public.submit_portfolio_inquiry(
  p_name text,
  p_email text,
  p_body text,
  p_access_token text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  inquiry_id uuid;
begin
  if p_name is null or char_length(btrim(p_name)) not between 1 and 80 then
    raise exception 'Name must be between 1 and 80 characters.' using errcode = '22023';
  end if;
  if p_email is null or char_length(p_email) not between 3 and 254
    or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' then
    raise exception 'Enter a valid email address.' using errcode = '22023';
  end if;
  if p_body is null or char_length(btrim(p_body)) not between 1 and 4000 then
    raise exception 'Your question must be between 1 and 4000 characters.' using errcode = '22023';
  end if;
  if p_access_token is null or p_access_token !~ '^[A-Za-z0-9_-]{43}$' then
    raise exception 'A valid private ticket token is required.' using errcode = '22023';
  end if;

  insert into public.portfolio_inquiries (name, email, access_token)
  values (btrim(p_name), btrim(p_email), p_access_token)
  returning id into inquiry_id;

  insert into public.portfolio_inquiry_messages (inquiry_id, sender, body)
  values (inquiry_id, 'visitor', btrim(p_body));

  return inquiry_id;
end;
$$;

create or replace function public.get_portfolio_inquiry(p_access_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  inquiry jsonb;
begin
  if p_access_token is null or p_access_token !~ '^[A-Za-z0-9_-]{43}$' then
    return null;
  end if;

  select jsonb_build_object(
    'id', i.id,
    'name', i.name,
    'created_at', i.created_at,
    'expires_at', i.expires_at,
    'messages', coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', m.id,
          'sender', m.sender,
          'body', m.body,
          'created_at', m.created_at
        ) order by m.created_at
      ) filter (where m.id is not null),
      '[]'::jsonb
    )
  )
  into inquiry
  from public.portfolio_inquiries as i
  left join public.portfolio_inquiry_messages as m on m.inquiry_id = i.id
  where i.access_token = p_access_token
    and i.expires_at > now()
  group by i.id;

  return inquiry;
end;
$$;

create or replace function public.reply_to_portfolio_inquiry(
  p_inquiry_id uuid,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  message_id uuid;
begin
  if not public.is_portfolio_admin() then
    raise exception 'Portfolio administrator access required.' using errcode = '42501';
  end if;
  if p_body is null or char_length(btrim(p_body)) not between 1 and 4000 then
    raise exception 'Your reply must be between 1 and 4000 characters.' using errcode = '22023';
  end if;
  if not exists (
    select 1
    from public.portfolio_inquiries
    where id = p_inquiry_id and expires_at > now()
  ) then
    raise exception 'This inquiry has expired or does not exist.' using errcode = '22023';
  end if;

  insert into public.portfolio_inquiry_messages (inquiry_id, sender, body)
  values (p_inquiry_id, 'admin', btrim(p_body))
  returning id into message_id;

  return message_id;
end;
$$;

revoke all on function public.submit_portfolio_inquiry(text, text, text, text) from public;
revoke all on function public.get_portfolio_inquiry(text) from public;
revoke all on function public.reply_to_portfolio_inquiry(uuid, text) from public;
grant execute on function public.submit_portfolio_inquiry(text, text, text, text)
  to anon, authenticated;
grant execute on function public.get_portfolio_inquiry(text)
  to anon, authenticated;
grant execute on function public.reply_to_portfolio_inquiry(uuid, text)
  to authenticated;

create extension if not exists pg_cron with schema pg_catalog;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'expire-portfolio-inquiries') then
    perform cron.unschedule(jobid)
    from cron.job
    where jobname = 'expire-portfolio-inquiries';
  end if;

  perform cron.schedule(
    'expire-portfolio-inquiries',
    '*/15 * * * *',
    'delete from public.portfolio_inquiries where expires_at <= now()'
  );
end;
$$;
