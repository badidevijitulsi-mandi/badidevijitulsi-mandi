-- श्री श्री बड़ी देवी जी, तुलसी मंडी — Supabase CMS setup
-- IMPORTANT: Replace admin@example.com below with the email you will use to sign in.
create extension if not exists pgcrypto;

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((auth.jwt() ->> 'email') = 'admin@example.com', false);
$$;

create table if not exists public.site_content (
  content_key text primary key,
  content_value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  description text not null default '',
  year_label text not null default '',
  category text not null default 'माँ दुर्गा दर्शन',
  media_url text not null,
  media_type text not null default 'image',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.creator_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  creator_name text not null default '',
  description text not null default '',
  video_url text not null,
  thumbnail_url text not null default '',
  platform text not null default 'अन्य',
  year_label text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.committee_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default 'सदस्य',
  phone text not null default '',
  photo_url text not null default '',
  bio text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date text not null default '',
  event_time text not null default '',
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
alter table public.gallery enable row level security;
alter table public.creator_videos enable row level security;
alter table public.committee_members enable row level security;
alter table public.events enable row level security;
alter table public.announcements enable row level security;

-- Public visitors can read published site data. Only the configured admin can change it.
drop policy if exists "public read site content" on public.site_content;
create policy "public read site content" on public.site_content for select using (true);
drop policy if exists "admin manage site content" on public.site_content;
create policy "admin manage site content" on public.site_content for all using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "public read gallery" on public.gallery;
create policy "public read gallery" on public.gallery for select using (true);
drop policy if exists "admin manage gallery" on public.gallery;
create policy "admin manage gallery" on public.gallery for all using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "public read creator videos" on public.creator_videos;
create policy "public read creator videos" on public.creator_videos for select using (true);
drop policy if exists "admin manage creator videos" on public.creator_videos;
create policy "admin manage creator videos" on public.creator_videos for all using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "public read committee" on public.committee_members;
create policy "public read committee" on public.committee_members for select using (true);
drop policy if exists "admin manage committee" on public.committee_members;
create policy "admin manage committee" on public.committee_members for all using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "public read events" on public.events;
create policy "public read events" on public.events for select using (true);
drop policy if exists "admin manage events" on public.events;
create policy "admin manage events" on public.events for all using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "public read announcements" on public.announcements;
create policy "public read announcements" on public.announcements for select using (active = true or public.is_site_admin());
drop policy if exists "admin manage announcements" on public.announcements;
create policy "admin manage announcements" on public.announcements for all using (public.is_site_admin()) with check (public.is_site_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('badi-devi-media','badi-devi-media',true,104857600,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public=true, file_size_limit=104857600,
allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime'];

drop policy if exists "public view badi devi media" on storage.objects;
create policy "public view badi devi media" on storage.objects for select using (bucket_id = 'badi-devi-media');
drop policy if exists "admin upload badi devi media" on storage.objects;
create policy "admin upload badi devi media" on storage.objects for insert to authenticated with check (bucket_id = 'badi-devi-media' and public.is_site_admin());
drop policy if exists "admin update badi devi media" on storage.objects;
create policy "admin update badi devi media" on storage.objects for update to authenticated using (bucket_id = 'badi-devi-media' and public.is_site_admin()) with check (bucket_id = 'badi-devi-media' and public.is_site_admin());
drop policy if exists "admin delete badi devi media" on storage.objects;
create policy "admin delete badi devi media" on storage.objects for delete to authenticated using (bucket_id = 'badi-devi-media' and public.is_site_admin());

-- Starter settings, editable from the admin panel
insert into public.site_content(content_key,content_value) values
('hero', '{"title":"श्री श्री बड़ी देवी जी","subtitle":"तुलसी मंडी","tagline":"सन् 1932 से माँ दुर्गा की पावन परंपरा","description":"आस्था, संस्कृति, परंपरा और सेवा — माँ दुर्गा की पूजा से जुड़ी जानकारी, इतिहास, तस्वीरें और वीडियो एक ही स्थान पर।","background_url":""}'::jsonb),
('history', '{"title":"हमारा इतिहास","body":"स्थानीय परंपरा के अनुसार, श्री श्री बड़ी देवी जी, तुलसी मंडी में सन् 1932 से माँ दुर्गा की प्रतिमा स्थापित की जाती रही है।"}'::jsonb),
('location', '{"address":"तुलसी मंडी, पटना, बिहार","map_url":""}'::jsonb),
('social', '{"instagram":"","facebook":"","youtube":"","whatsapp":""}'::jsonb),
('contact', '{"phone":"","email":""}'::jsonb)
on conflict (content_key) do nothing;
