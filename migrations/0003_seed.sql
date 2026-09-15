insert into listings (
  user_id, side, coin, amount, quote_asset, price, settlement, notes,
  contact_channel, contact_handle, status
)
select *
from (
  values
    ('desk', 'sell', 'WART', '2500', 'BCH', '0.000076', 'onchain',
     'Warthog mainnet. On-chain WART vs BCH.',
     'telegram', 'venice_desk', 'open'),
    ('desk', 'buy', 'WART', '800', 'BCH', '0.000062', 'onchain',
     'Restocking the community pot. Quoted in BCH.',
     'telegram', 'venice_desk', 'open'),
    ('desk', 'buy', 'KDA', '2000', 'BCH', '0.0012', 'onchain',
     'Kadena chain 0. Quoted in BCH.',
     'telegram', 'venice_desk', 'open'),
    ('desk', 'sell', 'HNS', '12000', 'BCH', '0.000019', 'onchain',
     'Handshake names parked.',
     'discord', 'venice', 'open'),
    ('desk', 'sell', 'XMR', '12', 'BCH', '0.28', 'onchain',
     'Monero. On-chain only.',
     'telegram', 'venice_desk', 'open'),
    ('desk', 'sell', 'KAS', '25000', 'BCH', '0.00021', 'onchain',
     'Kaspa. One output.',
     'discord', 'venice', 'open'),
    ('desk', 'sell', 'BCH', '8', 'BCH', '1', 'onchain',
     'Spot BCH size. Price is 1 BCH.',
     'telegram', 'venice_desk', 'open'),
    ('desk', 'sell', 'NEXA', '2400000', 'BCH', '0.000000036', 'onchain',
     'Nexa UTXOs, not wrapped.',
     'x', 'veniceotc', 'open'),
    ('desk', 'sell', 'ERG', '900', 'BCH', '0.0082', 'onchain',
     'Ergo native.',
     'telegram', 'venice_desk', 'open'),
    ('desk', 'buy', 'ETI', '4000', 'BCH', '0.00009', 'onchain',
     'Etica. Quoted in BCH.',
     'x', 'veniceotc', 'open')
) as v(user_id, side, coin, amount, quote_asset, price, settlement, notes, contact_channel, contact_handle, status)
where not exists (select 1 from listings limit 1);
