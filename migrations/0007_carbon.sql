create table if not exists carbon_passes (
  user_id    text primary key,
  chain      text not null check (chain in ('kas', 'kda', 'nexa')),
  address    text not null,
  token_ref  text not null,
  balance    text not null default '0',
  is_verified boolean not null default false,
  checked_at timestamptz not null default now()
);
