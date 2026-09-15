alter table carbon_passes add column if not exists holder boolean not null default false;
create unique index if not exists carbon_passes_chain_address
  on carbon_passes (chain, address);
