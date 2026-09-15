alter table carbon_passes add column if not exists is_verified boolean not null default false;
