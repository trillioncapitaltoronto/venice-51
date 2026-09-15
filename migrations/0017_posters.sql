create table if not exists posters (
  discord text primary key,
  granted_at timestamptz not null default now()
);
