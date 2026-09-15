create table if not exists takes (
  id serial primary key,
  listing_id int not null,
  discord text not null,
  wallet text not null default '',
  notes text not null default '',
  status text not null default 'open',
  created_at timestamptz not null default now()
);
