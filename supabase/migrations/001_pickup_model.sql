-- Reworks the parcel model to match the actual business: goods arrive from
-- China into a branch, and customers come pick them up in person — this is
-- NOT a door-to-door delivery business. Run this once against a project
-- that already has the original supabase/schema.sql applied.
--
-- What changes:
--   - parcels.status: ('pending','in_transit','delivered','returned')
--                  -> ('pending_pickup','picked_up','returned')
--   - parcels.delivered_at renamed to picked_up_at
--   - parcels.cost_amount added (what we paid for the goods/shipping)
--   - parcels.is_damaged / parcels.damage_note added

alter table parcels rename column delivered_at to picked_up_at;

alter table parcels add column cost_amount numeric(10, 2) not null default 0;
alter table parcels add column is_damaged boolean not null default false;
alter table parcels add column damage_note text;

alter table parcels drop constraint if exists parcels_status_check;

update parcels set status = 'pending_pickup' where status in ('pending', 'in_transit');
update parcels set status = 'picked_up' where status = 'delivered';

alter table parcels alter column status set default 'pending_pickup';
alter table parcels add constraint parcels_status_check
  check (status in ('pending_pickup', 'picked_up', 'returned'));
