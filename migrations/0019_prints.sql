create table if not exists prints (
  listing_id int primary key references listings(id),
  coin text not null,
  amount text not null,
  price text not null,
  poster_discord text not null,
  other_discord text not null,
  poster_wallet text not null default '',
  other_wallet text not null default '',
  poster_said boolean not null default false,
  other_said boolean not null default false,
  printed_at timestamptz,
  status text not null default 'pending'
);
