update listings
set status = 'withdrawn'
where coin not in (
  'WART','HNS','RXD','NEXA','ERG','ALPH','BEL','PEP','XEL','GRIN','FIRO','CLORE','NEOX','ZANO','TARI'
);
