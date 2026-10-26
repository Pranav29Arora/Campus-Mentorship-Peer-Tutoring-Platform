-- CampusConnect Initial PostgreSQL Schema for Supabase
-- Created for Campus Mentorship & Peer Tutoring Platform

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  roll_number text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'mentor', 'admin')),
  department text DEFAULT '',
  year integer DEFAULT 1,
  avatar text DEFAULT '',
  status text DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Mentors Table
CREATE TABLE IF NOT EXISTS mentors (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio text NOT NULL DEFAULT '',
  subjects text[] DEFAULT '{}',
  expertise text[] DEFAULT '{}',
  rating numeric(3,2) DEFAULT 5.00,
  total_sessions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Availability Table
CREATE TABLE IF NOT EXISTS availability (
  id text PRIMARY KEY,
  mentor_id text NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  date text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  status text DEFAULT 'available' CHECK (status IN ('available', 'booked')),
  subject text DEFAULT 'General Mentorship',
  created_at timestamptz DEFAULT now()
);

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id text PRIMARY KEY,
  student_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_id text NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  subject text NOT NULL DEFAULT 'General Mentorship',
  date text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  meeting_status text DEFAULT 'disconnected' CHECK (meeting_status IN ('disconnected', 'connecting', 'connected')),
  is_reviewed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id text PRIMARY KEY,
  booking_id text NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  student_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_id text NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'general',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Foreign Key Performance Indexes
CREATE INDEX IF NOT EXISTS mentors_user_id_idx ON mentors (user_id);
CREATE INDEX IF NOT EXISTS availability_mentor_id_idx ON availability (mentor_id);
CREATE INDEX IF NOT EXISTS availability_mentor_date_idx ON availability (mentor_id, date);
CREATE INDEX IF NOT EXISTS bookings_student_id_idx ON bookings (student_id);
CREATE INDEX IF NOT EXISTS bookings_mentor_id_idx ON bookings (mentor_id);
CREATE INDEX IF NOT EXISTS bookings_student_date_idx ON bookings (student_id, date, start_time);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings (status);
CREATE INDEX IF NOT EXISTS reviews_booking_id_idx ON reviews (booking_id);
CREATE INDEX IF NOT EXISTS reviews_student_id_idx ON reviews (student_id);
CREATE INDEX IF NOT EXISTS reviews_mentor_id_idx ON reviews (mentor_id);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications (user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Grant standard permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Security Policies
CREATE POLICY "users_select_policy" ON users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "users_insert_policy" ON users FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "users_update_policy" ON users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "mentors_select_policy" ON mentors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "mentors_insert_policy" ON mentors FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "mentors_update_policy" ON mentors FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "availability_select_policy" ON availability FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "availability_insert_policy" ON availability FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "availability_update_policy" ON availability FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "availability_delete_policy" ON availability FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "bookings_select_policy" ON bookings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "bookings_insert_policy" ON bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "bookings_update_policy" ON bookings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "reviews_select_policy" ON reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reviews_insert_policy" ON reviews FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "notifications_select_policy" ON notifications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "notifications_insert_policy" ON notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "notifications_update_policy" ON notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Auto-sync new users to Supabase Auth (auth.users and auth.identities)
CREATE OR REPLACE FUNCTION public.handle_sync_user_to_auth()
RETURNS trigger AS $$
DECLARE
  new_uid uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = NEW.email) THEN
    new_uid := gen_random_uuid();
    
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      is_sso_user,
      is_anonymous
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_uid,
      'authenticated',
      'authenticated',
      NEW.email,
      NEW.password_hash,
      now(),
      jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
      jsonb_build_object('name', NEW.name, 'role', NEW.role, 'department', NEW.department, 'roll_number', NEW.roll_number),
      COALESCE(NEW.created_at, now()),
      COALESCE(NEW.updated_at, now()),
      false,
      false
    );

    INSERT INTO auth.identities (
      id,
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      new_uid,
      new_uid::text,
      new_uid,
      jsonb_build_object('sub', new_uid::text, 'email', NEW.email),
      'email',
      now(),
      now(),
      now()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_public_user_created_sync_auth
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_sync_user_to_auth();

-- Record login timestamp in auth.users
CREATE OR REPLACE FUNCTION public.record_user_login(user_email text)
RETURNS void AS $$
BEGIN
  UPDATE auth.users
  SET last_sign_in_at = now()
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.record_user_login(text) TO anon, authenticated, service_role;

