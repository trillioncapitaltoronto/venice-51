alter table listings drop constraint if exists listings_quote_asset_check;

update listings set quote_asset = 'BCH';

update listings set price = '0.000076' where coin = 'WART' and side = 'sell' and user_id = 'desk';
update listings set price = '0.000062' where coin = 'WART' and side = 'buy' and user_id = 'desk';
update listings set price = '0.000019' where coin = 'HNS' and user_id = 'desk';
update listings set price = '0.00000042' where coin = 'RXD' and user_id = 'desk';
update listings set price = '0.000000036' where coin = 'NEXA' and user_id = 'desk';
update listings set price = '0.0082' where coin = 'ERG' and user_id = 'desk';
update listings set price = '0.00022' where coin = 'ALPH' and user_id = 'desk';
update listings set price = '0.00000062' where coin = 'BEL' and user_id = 'desk';
update listings set price = '0.0023' where coin = 'XEL' and user_id = 'desk';
update listings set price = '0.0038' where coin = 'GRIN' and user_id = 'desk';
update listings set price = '0.00184' where coin = 'FIRO' and user_id = 'desk';

alter table listings add constraint listings_quote_asset_check check (quote_asset in ('BCH'));
