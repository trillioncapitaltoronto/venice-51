update listings
set status = 'withdrawn'
where coin not in ('WART','KDA','HNS','XMR','KAS','BCH','NEXA','ERG','ETI');

insert into listings (
  user_id, side, coin, amount, quote_asset, price, settlement, notes,
  contact_channel, contact_handle, status
)
select v.user_id, v.side, v.coin, v.amount, v.quote_asset, v.price, v.settlement, v.notes,
       v.contact_channel, v.contact_handle, v.status
from (
  values
    ('desk', 'buy', 'KDA', '2000', 'BCH', '0.0012', 'onchain',
     'Kadena chain 0. Quoted in BCH.', 'telegram', 'venice_desk', 'open'),
    ('desk', 'sell', 'XMR', '12', 'BCH', '0.28', 'onchain',
     'Monero. On-chain only.', 'telegram', 'venice_desk', 'open'),
    ('desk', 'sell', 'KAS', '25000', 'BCH', '0.00021', 'onchain',
     'Kaspa. One output.', 'discord', 'venice', 'open'),
    ('desk', 'sell', 'BCH', '8', 'BCH', '1', 'onchain',
     'Spot BCH size against BCH is 1. Use this for inventory.', 'telegram', 'venice_desk', 'open'),
    ('desk', 'buy', 'ETI', '4000', 'BCH', '0.00009', 'onchain',
     'Etica. Research chain, quoted in BCH.', 'x', 'veniceotc', 'open')
) as v(user_id, side, coin, amount, quote_asset, price, settlement, notes, contact_channel, contact_handle, status)
where not exists (
  select 1 from listings l where l.user_id = 'desk' and l.coin = v.coin and l.status = 'open'
);
