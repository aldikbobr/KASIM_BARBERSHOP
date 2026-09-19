/*
# Create bookings table for barbershop appointments

1. New Tables
- `bookings`
- `id` (uuid, primary key)
- `barber` (text, not null) — selected barber name or "Любой"
- `location` (text, not null) — selected branch name
- `date` (text, not null) — selected date in YYYY-MM-DD format
- `time` (text, not null) — selected time slot e.g. "10:00"
- `name` (text, not null) — client name
- `phone` (text, not null) — client phone number
- `status` (text, default 'pending') — booking status
- `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `bookings`.
- This is a no-auth barbershop site: anon + authenticated can insert bookings.
- Only anon can insert (clients submitting the form); no public read access
  to protect client phone numbers and names.
*/

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber text NOT NULL,
  location text NOT NULL,
  date text NOT NULL,
  time text NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
TO anon, authenticated WITH CHECK (true);
