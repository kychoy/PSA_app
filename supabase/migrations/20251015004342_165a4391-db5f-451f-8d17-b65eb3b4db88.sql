-- Create enum for alert methods
CREATE TYPE alert_method AS ENUM ('email', 'sms', 'voice_call');

-- Create enum for alert status
CREATE TYPE alert_status AS ENUM ('pending', 'sent', 'failed', 'acknowledged');

-- Create profiles table for extended user info
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create elderly_profiles table
CREATE TABLE public.elderly_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INTEGER,
  address TEXT,
  medical_notes TEXT,
  inactivity_threshold_hours INTEGER NOT NULL DEFAULT 24,
  last_activity_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create contacts table
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_profile_id UUID NOT NULL REFERENCES public.elderly_profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  relationship TEXT,
  email TEXT,
  phone TEXT,
  preferred_alert_method alert_method NOT NULL DEFAULT 'email',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT contact_communication CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_profile_id UUID NOT NULL REFERENCES public.elderly_profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  notes TEXT,
  logged_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create alert_history table
CREATE TABLE public.alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_profile_id UUID NOT NULL REFERENCES public.elderly_profiles(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  alert_method alert_method NOT NULL,
  status alert_status NOT NULL DEFAULT 'pending',
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elderly_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for elderly_profiles
CREATE POLICY "Caregivers can view their elderly profiles"
  ON public.elderly_profiles FOR SELECT
  USING (auth.uid() = caregiver_id);

CREATE POLICY "Caregivers can create elderly profiles"
  ON public.elderly_profiles FOR INSERT
  WITH CHECK (auth.uid() = caregiver_id);

CREATE POLICY "Caregivers can update their elderly profiles"
  ON public.elderly_profiles FOR UPDATE
  USING (auth.uid() = caregiver_id);

CREATE POLICY "Caregivers can delete their elderly profiles"
  ON public.elderly_profiles FOR DELETE
  USING (auth.uid() = caregiver_id);

-- RLS Policies for contacts
CREATE POLICY "Caregivers can view contacts of their elderly profiles"
  ON public.contacts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.elderly_profiles
    WHERE id = contacts.elderly_profile_id
    AND caregiver_id = auth.uid()
  ));

CREATE POLICY "Caregivers can create contacts for their elderly profiles"
  ON public.contacts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.elderly_profiles
    WHERE id = contacts.elderly_profile_id
    AND caregiver_id = auth.uid()
  ));

CREATE POLICY "Caregivers can update contacts of their elderly profiles"
  ON public.contacts FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.elderly_profiles
    WHERE id = contacts.elderly_profile_id
    AND caregiver_id = auth.uid()
  ));

CREATE POLICY "Caregivers can delete contacts of their elderly profiles"
  ON public.contacts FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.elderly_profiles
    WHERE id = contacts.elderly_profile_id
    AND caregiver_id = auth.uid()
  ));

-- RLS Policies for activity_logs
CREATE POLICY "Caregivers can view activity logs of their elderly profiles"
  ON public.activity_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.elderly_profiles
    WHERE id = activity_logs.elderly_profile_id
    AND caregiver_id = auth.uid()
  ));

CREATE POLICY "Caregivers can create activity logs for their elderly profiles"
  ON public.activity_logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.elderly_profiles
    WHERE id = activity_logs.elderly_profile_id
    AND caregiver_id = auth.uid()
  ));

-- RLS Policies for alert_history
CREATE POLICY "Caregivers can view alert history of their elderly profiles"
  ON public.alert_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.elderly_profiles
    WHERE id = alert_history.elderly_profile_id
    AND caregiver_id = auth.uid()
  ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_elderly_profiles_updated_at
  BEFORE UPDATE ON public.elderly_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_elderly_profiles_caregiver ON public.elderly_profiles(caregiver_id);
CREATE INDEX idx_elderly_profiles_last_activity ON public.elderly_profiles(last_activity_at);
CREATE INDEX idx_contacts_elderly_profile ON public.contacts(elderly_profile_id);
CREATE INDEX idx_activity_logs_elderly_profile ON public.activity_logs(elderly_profile_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_alert_history_elderly_profile ON public.alert_history(elderly_profile_id);
CREATE INDEX idx_alert_history_created_at ON public.alert_history(created_at DESC);