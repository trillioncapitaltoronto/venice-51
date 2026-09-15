alter table listings add column if not exists wallet_address text not null default '';
alter table listings add column if not exists wallet_balance text not null default '';
alter table listings add column if not exists wallet_verified boolean not null default false;
alter table listings add column if not exists wallet_checked_at timestamptz;
