create table if not exists desk_bch (
  id int primary key default 1 check (id = 1),
  pubkey text not null
);

create table if not exists bch_escrows (
  id serial primary key,
  listing_id int not null references listings(id),
  amount_bch text not null,
  payer_pub text,
  payee_pub text,
  desk_pub text not null,
  address text,
  status text not null default 'waiting_keys'
    check (status in ('waiting_keys','waiting_fund','funded','released','refunded')),
  created_at timestamptz not null default now()
);

create unique index if not exists bch_escrows_open_listing
  on bch_escrows (listing_id)
  where status in ('waiting_keys','waiting_fund','funded');
