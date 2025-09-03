-- Пользователи
create table users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique not null,
  username text,
  first_name text,
  last_name text,
  points int default 0,
  created_at timestamptz default now()
);

-- Бизнесы
create table businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  company_name text,
  created_at timestamptz default now()
);

-- Кампании
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  image_url text,
  target_link text not null,
  utm_template text not null,
  caption_template text not null,
  points_reward int default 10,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Шаринги
create table shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete cascade,
  shared_at timestamptz default now(),
  utm_link text not null,
  short_code text unique not null,
  constraint unique_share_per_day unique (user_id, campaign_id, date(shared_at))
);

-- Клики
create table clicks (
  id uuid primary key default gen_random_uuid(),
  utm_link text not null,
  campaign_id uuid references campaigns(id),
  user_id uuid references users(id),
  clicked_at timestamptz default now(),
  ip text,
  user_agent text
);
