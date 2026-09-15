create table if not exists fills (
  id serial primary key,
  listing_id int not null unique references listings(id),
  poster_discord text not null,
  counterparty_discord text not null,
  created_at timestamptz not null default now()
);

create index if not exists fills_poster_idx on fills (lower(poster_discord));
create index if not exists fills_counterparty_idx on fills (lower(counterparty_discord));

create table if not exists reports (
  id serial primary key,
  listing_id int not null references listings(id),
  reporter_discord text not null,
  note text not null,
  status text not null default 'open'
    check (status in ('open', 'reimbursed', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists reports_listing_idx on reports (listing_id);
