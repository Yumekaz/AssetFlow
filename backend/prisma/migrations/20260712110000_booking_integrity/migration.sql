-- Database-level protection for overlapping active reservations.
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE INDEX IF NOT EXISTS "Booking_assetId_startTime_endTime_idx" ON "Booking" ("assetId", "startTime", "endTime");
ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_no_overlapping_active_ranges"
  EXCLUDE USING gist (
    "assetId" WITH =,
    tsrange("startTime", "endTime", '[)') WITH &&
  ) WHERE ("status" IN ('Pending', 'Approved', 'Upcoming', 'Ongoing'));
