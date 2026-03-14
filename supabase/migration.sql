-- WebWatch AI — Database Migration
-- Run this in your Supabase SQL editor

-- Settings (single row, id=1)
create table if not exists settings (
  id integer primary key default 1,
  tg_bot_token text default '',
  tg_chat_id text default '',
  notify_news boolean default true,
  notify_jobs boolean default true,
  notify_weekends boolean default false,
  news_max_items integer default 5,
  news_daily_observation boolean default true,
  news_include_keywords text[] default '{}',
  news_exclude_keywords text[] default '{}',
  job_keywords text[] default '{}',
  job_cities text[] default '{}',
  job_categories text[] default '{}',
  job_min_salary integer default 0,
  job_notify_new_only boolean default true
);

insert into settings (id) values (1) on conflict (id) do nothing;

-- News sources
create table if not exists news_sources (
  id serial primary key,
  name text not null,
  url text not null default '',
  feed_url text not null,
  enabled boolean default true
);

insert into news_sources (name, url, feed_url, enabled) values
  ('科技新報', 'technews.tw', 'https://technews.tw/feed/', true),
  ('iThome', 'ithome.com.tw', 'https://www.ithome.com.tw/rss', true),
  ('TechCrunch', 'techcrunch.com', 'https://techcrunch.com/feed/', false),
  ('The Verge', 'theverge.com', 'https://www.theverge.com/rss/index.xml', false)
on conflict do nothing;

-- News items (deduplicated by url_hash)
create table if not exists news_items (
  id serial primary key,
  title text not null,
  url text not null,
  source text,
  published_at timestamptz,
  summary text,
  url_hash text unique,
  fetched_at timestamptz default now()
);

-- 104 job snapshots (deduplicated by job_id)
create table if not exists job_items (
  id serial primary key,
  job_id text unique not null,
  title text,
  company text,
  location text,
  salary text,
  url text,
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  is_active boolean default true
);

-- Notification logs
create table if not exists notification_logs (
  id serial primary key,
  type text,
  payload text,
  sent_at timestamptz default now(),
  status text
);
