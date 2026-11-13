create table if not exists public.portfolio_analytics_daily (
  viewed_on date primary key default current_date,
  page_views bigint not null default 0 check (page_views >= 0)
);

alter table public.portfolio_analytics_daily enable row level security;

drop policy if exists "Portfolio admins can read analytics" on public.portfolio_analytics_daily;
create policy "Portfolio admins can read analytics"
on public.portfolio_analytics_daily for select to authenticated
using ((select public.is_portfolio_admin()));

grant select on public.portfolio_analytics_daily to authenticated;

create or replace function public.record_portfolio_view()
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  insert into public.portfolio_analytics_daily as daily (viewed_on, page_views)
  values (current_date, 1)
  on conflict (viewed_on)
  do update set page_views = daily.page_views + 1;
$$;

revoke all on function public.record_portfolio_view() from public;
grant execute on function public.record_portfolio_view() to anon, authenticated;

create or replace function public.get_portfolio_view_count()
returns bigint
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(sum(page_views), 0)::bigint
  from public.portfolio_analytics_daily;
$$;

revoke all on function public.get_portfolio_view_count() from public;
grant execute on function public.get_portfolio_view_count() to anon, authenticated;
