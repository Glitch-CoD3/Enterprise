create table if not exists public.portfolio_feed_posts (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('learning', 'article', 'clip', 'photo')),
  title text not null check (char_length(btrim(title)) between 1 and 140),
  body text not null check (char_length(btrim(body)) between 1 and 10000),
  media_type text check (media_type in ('image', 'video')),
  media_url text not null default '',
  media_path text,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  check ((media_type is null and media_url = '' and media_path is null) or (media_type is not null and media_url <> ''))
);

create index if not exists portfolio_feed_posts_visible_created_at_idx
  on public.portfolio_feed_posts (created_at desc)
  where visible;

alter table public.portfolio_feed_posts enable row level security;

drop policy if exists "Public can read visible feed posts" on public.portfolio_feed_posts;
create policy "Public can read visible feed posts"
on public.portfolio_feed_posts for select to anon, authenticated
using (visible);

drop policy if exists "Portfolio admins can manage feed posts" on public.portfolio_feed_posts;
create policy "Portfolio admins can manage feed posts"
on public.portfolio_feed_posts for all to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

grant select on public.portfolio_feed_posts to anon, authenticated;
grant insert, update, delete on public.portfolio_feed_posts to authenticated;

update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'video/quicktime'
    ]
where id = 'portfolio-media';
