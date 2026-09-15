create table if not exists listings (
  id              serial primary key,
  user_id         text not null,
  side            text not null check (side in ('buy', 'sell')),
  coin            text not null,
  amount          text not null,
  quote_asset     text not null check (quote_asset in ('BCH')),
  price           text not null,
  settlement      text not null check (settlement in ('onchain', 'bank', 'crypto')),
  notes           text not null default '',
  contact_channel text not null check (contact_channel in ('telegram', 'discord', 'x', 'email')),
  contact_handle  text not null,
  status          text not null default 'open' check (status in ('open', 'filled', 'withdrawn')),
  created_at      timestamptz not null default now()
);

create index if not exists listings_status_coin_idx on listings (status, coin, created_at desc);
create index if not exists listings_user_id_idx on listings (user_id);

create table if not exists pings (
  id          serial primary key,
  listing_id  integer not null references listings(id),
  user_id     text not null,
  message     text not null,
  reply_via   text not null check (reply_via in ('telegram', 'discord', 'x', 'email')),
  reply_handle text not null,
  created_at  timestamptz not null default now(),
  unique (listing_id, user_id)
);

create index if not exists pings_listing_id_idx on pings (listing_id);
