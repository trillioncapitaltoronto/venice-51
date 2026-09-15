create table if not exists members (
  discord text primary key,
  referred_by text not null,
  vouched boolean not null default false,
  created_at timestamptz not null default now()
);

insert into members (discord, referred_by, vouched)
values
  ('venice', 'founders', true),
  ('venice_desk', 'founders', true),
  ('veniceotc', 'founders', true)
on conflict (discord) do nothing;

alter table listings add column if not exists vouch_confirmed boolean not null default false;
