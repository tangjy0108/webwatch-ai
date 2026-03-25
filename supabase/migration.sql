-- WebWatch AI — Database Migration
-- Run this in your Supabase SQL editor

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
  news_summary_length text default 'medium',
  news_weekend boolean default false,
  job_keywords text[] default '{}',
  job_cities text[] default '{}',
  job_categories text[] default '{}',
  job_min_salary integer default 0,
  job_experience text default 'any',
  job_exclude_companies text[] default '{}',
  job_notify_new_only boolean default true,
  job_notify_salary_change boolean default true,
  job_notify_removed boolean default false,
  jobs_weekend boolean default false
);

alter table settings add column if not exists news_summary_length text default 'medium';
alter table settings add column if not exists news_weekend boolean default false;
alter table settings add column if not exists job_experience text default 'any';
alter table settings add column if not exists job_exclude_companies text[] default '{}';
alter table settings add column if not exists job_notify_salary_change boolean default true;
alter table settings add column if not exists job_notify_removed boolean default false;
alter table settings add column if not exists jobs_weekend boolean default false;

insert into settings (id) values (1) on conflict (id) do nothing;

create table if not exists news_sources (
  id serial primary key,
  name text not null,
  url text not null default '',
  feed_url text not null,
  enabled boolean default true
);

create unique index if not exists news_sources_feed_url_uidx on news_sources (feed_url);

insert into news_sources (name, url, feed_url, enabled) values
  ('科技新報', 'technews.tw', 'https://technews.tw/feed/', true),
  ('iThome', 'ithome.com.tw', 'https://www.ithome.com.tw/rss', true),
  ('TechCrunch', 'techcrunch.com', 'https://techcrunch.com/feed/', false),
  ('The Verge', 'theverge.com', 'https://www.theverge.com/rss/index.xml', false)
on conflict (feed_url) do update
set name = excluded.name,
    url = excluded.url,
    enabled = excluded.enabled;

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

create table if not exists job_items (
  id serial primary key,
  job_id text unique not null,
  title text,
  company text,
  location text,
  salary text,
  url text,
  description text,
  salary_low integer default 0,
  salary_high integer default 0,
  category_tags text[] default '{}',
  experience_bucket text default 'any',
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  is_active boolean default true,
  removed_at timestamptz
);

alter table job_items add column if not exists description text;
alter table job_items add column if not exists salary_low integer default 0;
alter table job_items add column if not exists salary_high integer default 0;
alter table job_items add column if not exists category_tags text[] default '{}';
alter table job_items add column if not exists experience_bucket text default 'any';
alter table job_items add column if not exists removed_at timestamptz;

create table if not exists notification_logs (
  id serial primary key,
  type text,
  payload text,
  sent_at timestamptz default now(),
  status text
);
