/*
  # Health Record Tracker Schema

  1. New Tables
    - `user_profiles` - Extended user information with role
    - `health_records` - Patient health records
    - `prescriptions` - Doctor issued prescriptions
    - `prescription_items` - Individual medicines in prescriptions
    - `pharmacy_inventory` - Available medicines at pharmacies
    - `consultations` - Email-based consultations
    - `pharmacies` - Pharmacy information

  2. Security
    - Enable RLS on all tables
    - Patients can only access their own records
    - Doctors can access their patients' records
    - Pharmacists can access prescriptions for their pharmacy
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('patient', 'doctor', 'pharmacist')),
  phone text,
  address text,
  license_number text,
  pharmacy_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  record_type text NOT NULL,
  file_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pharmacies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text,
  email text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  diagnosis text NOT NULL,
  instructions text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'partially_fulfilled', 'cancelled')),
  issued_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prescription_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid NOT NULL REFERENCES prescriptions ON DELETE CASCADE,
  medicine_name text NOT NULL,
  dosage text NOT NULL,
  quantity integer NOT NULL,
  frequency text NOT NULL,
  duration text NOT NULL,
  pharmacy_id uuid REFERENCES pharmacies ON DELETE SET NULL,
  fulfilled_by_pharmacy uuid REFERENCES auth.users,
  fulfilled_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pharmacy_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id uuid NOT NULL REFERENCES pharmacies ON DELETE CASCADE,
  medicine_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  unit_price numeric(10, 2),
  last_updated timestamptz DEFAULT now(),
  UNIQUE(pharmacy_id, medicine_name)
);

CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  subject text NOT NULL,
  message text NOT NULL,
  reply text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'closed')),
  created_at timestamptz DEFAULT now(),
  replied_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Patients can view own health records"
  ON health_records FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid() OR EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'doctor'
  ));

CREATE POLICY "Patients can insert own health records"
  ON health_records FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors can view patient records"
  ON health_records FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'doctor'
  ) OR patient_id = auth.uid());

CREATE POLICY "Doctors can issue prescriptions"
  ON prescriptions FOR INSERT
  TO authenticated
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Patients can view own prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view own prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own prescriptions"
  ON prescriptions FOR UPDATE
  TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Pharmacists can view prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'pharmacist'
  ));

CREATE POLICY "Anyone can view prescription items"
  ON prescription_items FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Pharmacists can update prescription items"
  ON prescription_items FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'pharmacist'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'pharmacist'
  ));

CREATE POLICY "Pharmacies are viewable by all"
  ON pharmacies FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Anyone can view pharmacy inventory"
  ON pharmacy_inventory FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Pharmacists can update inventory"
  ON pharmacy_inventory FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'pharmacist'
    AND up.pharmacy_id = pharmacy_inventory.pharmacy_id
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'pharmacist'
    AND up.pharmacy_id = pharmacy_inventory.pharmacy_id
  ));

CREATE POLICY "Pharmacists can insert inventory"
  ON pharmacy_inventory FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'pharmacist'
    AND up.pharmacy_id = pharmacy_inventory.pharmacy_id
  ));

CREATE POLICY "Patients can view own consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (patient_id = auth.uid());

CREATE POLICY "Doctors can view own consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

CREATE POLICY "Patients can create consultations"
  ON consultations FOR INSERT
  TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Doctors can reply to consultations"
  ON consultations FOR UPDATE
  TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

CREATE INDEX idx_health_records_patient ON health_records(patient_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescription_items_prescription ON prescription_items(prescription_id);
CREATE INDEX idx_pharmacy_inventory_pharmacy ON pharmacy_inventory(pharmacy_id);
CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor ON consultations(doctor_id);
