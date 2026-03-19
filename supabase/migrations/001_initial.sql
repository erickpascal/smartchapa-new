CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'passenger'
    CHECK (role IN ('passenger','driver','operator','admin')),
  wallet_balance DECIMAL(10,2) DEFAULT 0,
  preferred_language TEXT DEFAULT 'pt',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  start_stop_id UUID,
  end_stop_id UUID,
  distance_km DECIMAL(8,2),
  base_fare DECIMAL(8,2) NOT NULL,
  category TEXT DEFAULT 'chapa'
    CHECK (category IN ('chapa','metro','expresso')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL,
  route_id UUID REFERENCES routes(id),
  sequence_order INTEGER NOT NULL
);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plate TEXT UNIQUE NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 14,
  model TEXT,
  year INTEGER,
  operator_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active','inactive','maintenance'))
);

CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  route_id UUID REFERENCES routes(id),
  vehicle_id UUID REFERENCES vehicles(id),
  driver_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','en_route','at_stop','completed','cancelled')),
  depart_time TIMESTAMPTZ NOT NULL,
  arrive_time TIMESTAMPTZ NOT NULL,
  available_seats INTEGER NOT NULL,
  total_seats INTEGER NOT NULL DEFAULT 14,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES trips(id),
  passenger_id UUID REFERENCES users(id),
  pickup_stop_id UUID REFERENCES stops(id),
  dropoff_stop_id UUID REFERENCES stops(id),
  seat_number INTEGER NOT NULL,
  fare DECIMAL(8,2) NOT NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','cancelled','completed')),
  payment_method TEXT CHECK (payment_method IN ('mpesa','emola','wallet')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id),
  amount DECIMAL(10,2) NOT NULL,
  provider TEXT NOT NULL,
  transaction_ref TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','processing','completed','failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) UNIQUE,
  passenger_id UUID REFERENCES users(id),
  driver_id UUID REFERENCES users(id),
  score INTEGER CHECK (score BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE driver_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES users(id),
  doc_type TEXT NOT NULL
    CHECK (doc_type IN ('licence','vehicle_registration','id_card')),
  file_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  reviewer_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed: 5 Maputo routes
INSERT INTO routes (name, distance_km, base_fare, category) VALUES
  ('Baixa → Museu', 5.2, 15, 'chapa'),
  ('Machava → Julius Nyerere', 12.8, 25, 'chapa'),
  ('Costa do Sol → Praça', 18.5, 30, 'chapa'),
  ('Benfica → Baixa', 8.1, 20, 'metro'),
  ('Zimpeto → Julius Nyerere', 15.3, 25, 'expresso');

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "bookings_own" ON bookings FOR ALL USING (auth.uid() = passenger_id);
CREATE POLICY "routes_public" ON routes FOR SELECT USING (true);
CREATE POLICY "trips_public" ON trips FOR SELECT USING (true);
CREATE POLICY "stops_public" ON stops FOR SELECT USING (true);

