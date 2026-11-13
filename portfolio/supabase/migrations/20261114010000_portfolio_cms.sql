create table if not exists public.portfolio_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_profile (
  id smallint primary key default 1 check (id = 1),
  full_name text not null default '',
  role text not null default '',
  email text not null default '',
  phone text not null default '',
  location text not null default '',
  avatar_url text not null default '',
  about text not null default '',
  availability text not null default '',
  resume_url text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_site_settings (
  id smallint primary key default 1 check (id = 1),
  site_title text not null default '',
  tagline text not null default '',
  hero_title text not null default 'Building useful things',
  hero_subtitle text not null default 'with thoughtful details.',
  about_heading text not null default 'A little about me',
  skills_heading text not null default 'Areas of focus',
  education_heading text not null default 'Education',
  projects_heading text not null default 'Selected work',
  accent_color text not null default '#3158c8',
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default '',
  icon_url text not null default '',
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_education (
  id uuid primary key default gen_random_uuid(),
  period text not null default '',
  qualification text not null,
  institution text not null default '',
  description text not null default '',
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  image_url text not null default '',
  technologies text[] not null default '{}',
  project_url text not null default '',
  featured boolean not null default false,
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  label text not null default '',
  url text not null,
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_portfolio_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.portfolio_admins
    where user_id = (select auth.uid())
  );
$$;

create or replace function public.set_portfolio_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists portfolio_profile_updated_at on public.portfolio_profile;
create trigger portfolio_profile_updated_at before update on public.portfolio_profile
for each row execute function public.set_portfolio_updated_at();

drop trigger if exists portfolio_site_settings_updated_at on public.portfolio_site_settings;
create trigger portfolio_site_settings_updated_at before update on public.portfolio_site_settings
for each row execute function public.set_portfolio_updated_at();

drop trigger if exists portfolio_skills_updated_at on public.portfolio_skills;
create trigger portfolio_skills_updated_at before update on public.portfolio_skills
for each row execute function public.set_portfolio_updated_at();

drop trigger if exists portfolio_education_updated_at on public.portfolio_education;
create trigger portfolio_education_updated_at before update on public.portfolio_education
for each row execute function public.set_portfolio_updated_at();

drop trigger if exists portfolio_projects_updated_at on public.portfolio_projects;
create trigger portfolio_projects_updated_at before update on public.portfolio_projects
for each row execute function public.set_portfolio_updated_at();

drop trigger if exists portfolio_social_links_updated_at on public.portfolio_social_links;
create trigger portfolio_social_links_updated_at before update on public.portfolio_social_links
for each row execute function public.set_portfolio_updated_at();

alter table public.portfolio_admins enable row level security;
alter table public.portfolio_profile enable row level security;
alter table public.portfolio_site_settings enable row level security;
alter table public.portfolio_skills enable row level security;
alter table public.portfolio_education enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_social_links enable row level security;

drop policy if exists "Admins can read their own admin record" on public.portfolio_admins;
create policy "Admins can read their own admin record"
on public.portfolio_admins for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Public can read profile" on public.portfolio_profile;
create policy "Public can read profile"
on public.portfolio_profile for select to anon, authenticated using (true);
drop policy if exists "Admins can manage profile" on public.portfolio_profile;
create policy "Admins can manage profile"
on public.portfolio_profile for all to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "Public can read site settings" on public.portfolio_site_settings;
create policy "Public can read site settings"
on public.portfolio_site_settings for select to anon, authenticated using (true);
drop policy if exists "Admins can manage site settings" on public.portfolio_site_settings;
create policy "Admins can manage site settings"
on public.portfolio_site_settings for all to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "Public can read visible skills" on public.portfolio_skills;
create policy "Public can read visible skills"
on public.portfolio_skills for select to anon, authenticated using (visible);
drop policy if exists "Admins can read all skills" on public.portfolio_skills;
create policy "Admins can read all skills"
on public.portfolio_skills for select to authenticated
using ((select public.is_portfolio_admin()));
drop policy if exists "Admins can manage skills" on public.portfolio_skills;
create policy "Admins can manage skills"
on public.portfolio_skills for all to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "Public can read visible education" on public.portfolio_education;
create policy "Public can read visible education"
on public.portfolio_education for select to anon, authenticated using (visible);
drop policy if exists "Admins can read all education" on public.portfolio_education;
create policy "Admins can read all education"
on public.portfolio_education for select to authenticated
using ((select public.is_portfolio_admin()));
drop policy if exists "Admins can manage education" on public.portfolio_education;
create policy "Admins can manage education"
on public.portfolio_education for all to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "Public can read visible projects" on public.portfolio_projects;
create policy "Public can read visible projects"
on public.portfolio_projects for select to anon, authenticated using (visible);
drop policy if exists "Admins can read all projects" on public.portfolio_projects;
create policy "Admins can read all projects"
on public.portfolio_projects for select to authenticated
using ((select public.is_portfolio_admin()));
drop policy if exists "Admins can manage projects" on public.portfolio_projects;
create policy "Admins can manage projects"
on public.portfolio_projects for all to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

drop policy if exists "Public can read visible social links" on public.portfolio_social_links;
create policy "Public can read visible social links"
on public.portfolio_social_links for select to anon, authenticated using (visible);
drop policy if exists "Admins can read all social links" on public.portfolio_social_links;
create policy "Admins can read all social links"
on public.portfolio_social_links for select to authenticated
using ((select public.is_portfolio_admin()));
drop policy if exists "Admins can manage social links" on public.portfolio_social_links;
create policy "Admins can manage social links"
on public.portfolio_social_links for all to authenticated
using ((select public.is_portfolio_admin()))
with check ((select public.is_portfolio_admin()));

grant select on public.portfolio_profile, public.portfolio_site_settings,
  public.portfolio_skills, public.portfolio_education, public.portfolio_projects,
  public.portfolio_social_links to anon, authenticated;
grant insert, update, delete on public.portfolio_profile, public.portfolio_site_settings,
  public.portfolio_skills, public.portfolio_education, public.portfolio_projects,
  public.portfolio_social_links to authenticated;
grant select on public.portfolio_admins to authenticated;
grant execute on function public.is_portfolio_admin() to authenticated;

insert into public.portfolio_profile
  (id, full_name, role, email, phone, location, avatar_url, about, availability)
values
  (1, 'MD Juel Rana', 'Software Developer', 'juelr5351@gmail.com',
   '+880 1581-838244', 'Sylhet, Bangladesh', '/img.jpg',
   'I am a Computer Science and Engineering student at SUST. I build software with C++, Java, and Python, and I am especially interested in AI engineering, game development, and thoughtful web experiences.',
   'Open to opportunities')
on conflict (id) do nothing;

insert into public.portfolio_site_settings (
  id, site_title, tagline, hero_title, hero_subtitle, about_heading,
  skills_heading, education_heading, projects_heading, accent_color
)
values (
  1, 'MD Juel Rana', 'Software developer & creative technologist',
  'Building useful things', 'with thoughtful details.', 'A little about me',
  'Areas of focus', 'Education', 'Selected work', '#3158c8'
)
on conflict (id) do nothing;

insert into public.portfolio_skills (name, category, icon_url, sort_order)
select seed.name, seed.category, seed.icon_url, seed.sort_order
from (values
  ('C++', 'Programming', '', 1),
  ('Java', 'Programming', '', 2),
  ('Python', 'Programming', '', 3),
  ('React', 'Web development', '', 4),
  ('HTML & CSS', 'Web development', '', 5),
  ('Unreal Engine 5', 'Game development', '', 6),
  ('Git & GitHub', 'Tools', '', 7)
) as seed(name, category, icon_url, sort_order)
where not exists (select 1 from public.portfolio_skills);

insert into public.portfolio_education (period, qualification, institution, description, sort_order)
select seed.period, seed.qualification, seed.institution, seed.description, seed.sort_order
from (values
  ('2022 — Present', 'BSc in Computer Science and Engineering', 'School of Applied Sciences and Technology, SUST', 'Focus on software engineering, algorithms, and 3D game development with Unreal Engine 5.', 1),
  ('2019 — 2021', 'Higher Secondary Certificate', 'Jashore Cantonment College', 'Studied physics, chemistry, mathematics, and information technology.', 2)
) as seed(period, qualification, institution, description, sort_order)
where not exists (select 1 from public.portfolio_education);

insert into public.portfolio_projects (title, description, image_url, technologies, project_url, featured, sort_order)
select seed.title, seed.description, seed.image_url, seed.technologies, seed.project_url, seed.featured, seed.sort_order
from (values
  ('My Portfolio', 'A personal portfolio showcasing my work, interests, and development journey.', '/portfolio.jpeg', array['HTML', 'CSS', 'JavaScript', 'React']::text[], 'https://juelrana.netlify.app/', true, 1),
  ('Scientific Calculator', 'A desktop scientific calculator built for practical everyday calculations.', '/calc.png', array['Python', 'Tkinter', 'CustomTkinter']::text[], '', false, 2),
  ('The Last Ascent', 'An open-world survival game set in a dense jungle environment.', '/game.png', array['Unreal Engine 5', 'Blender']::text[], 'https://lnkd.in/p/g-9qy8Sh', false, 3),
  ('Online Education Platform', 'A responsive education platform built with a customized WordPress experience.', '/educationPlatform.jpeg', array['CSS', 'WordPress', 'Customization']::text[], 'https://dev-eduq.pantheonsite.io/', false, 4)
) as seed(title, description, image_url, technologies, project_url, featured, sort_order)
where not exists (select 1 from public.portfolio_projects);

insert into public.portfolio_social_links (platform, label, url, sort_order)
select seed.platform, seed.label, seed.url, seed.sort_order
from (values
  ('GitHub', 'GitHub', 'https://github.com/Glitch-CoD3', 1),
  ('LinkedIn', 'LinkedIn', 'https://www.linkedin.com/in/md-juel-rana-944949202', 2),
  ('Facebook', 'Facebook', 'https://www.facebook.com/juel.rana.chaya/', 3),
  ('YouTube', 'YouTube', 'https://www.youtube.com/@mdjuelrana3500', 4)
) as seed(platform, label, url, sort_order)
where not exists (select 1 from public.portfolio_social_links);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-media', 'portfolio-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view portfolio media" on storage.objects;
create policy "Public can view portfolio media"
on storage.objects for select to anon, authenticated
using (bucket_id = 'portfolio-media');

drop policy if exists "Portfolio admins can upload media" on storage.objects;
create policy "Portfolio admins can upload media"
on storage.objects for insert to authenticated
with check (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()));

drop policy if exists "Portfolio admins can update media" on storage.objects;
create policy "Portfolio admins can update media"
on storage.objects for update to authenticated
using (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()))
with check (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()));

drop policy if exists "Portfolio admins can delete media" on storage.objects;
create policy "Portfolio admins can delete media"
on storage.objects for delete to authenticated
using (bucket_id = 'portfolio-media' and (select public.is_portfolio_admin()));
