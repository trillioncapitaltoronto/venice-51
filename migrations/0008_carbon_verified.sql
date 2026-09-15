create table if not exists carbon_passes (
  user_id    text primary key,
  chain      text not null default 'kas',
  address    text not null default '',
  token_ref  text not null default '',
  balance    text not null default '0',
  verified   boolean not null default false,
  checked_at timestamptz not null default now()
);

alter table carbon_passes add column if not exists chain text;
alter table carbon_passes add column if not exists address text;
alter table carbon_passes add column if not exists token_ref text;
alter table carbon_passes add column if not exists balance text;
alter table carbon_passes add column if not exists verified boolean;
alter table carbon_passes add column if not exists checked_at timestamptz;
