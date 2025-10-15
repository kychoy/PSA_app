-- Add notification_method to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_method text DEFAULT 'email' CHECK (notification_method IN ('email', 'sms', 'voice'));

-- Rename phone to phone_number for consistency
ALTER TABLE public.profiles 
RENAME COLUMN phone TO phone_number;

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'caregiver', 'user');

-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add device_id to elderly_profiles to track CP141 devices
ALTER TABLE public.elderly_profiles
ADD COLUMN IF NOT EXISTS device_id text,
ADD COLUMN IF NOT EXISTS device_phone_number text;

-- Create table to track SMS activity from CP141
CREATE TABLE public.device_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  elderly_profile_id uuid REFERENCES public.elderly_profiles(id) ON DELETE CASCADE NOT NULL,
  device_id text,
  received_at timestamptz NOT NULL DEFAULT now(),
  sms_from text,
  sms_body text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on device_activity
ALTER TABLE public.device_activity ENABLE ROW LEVEL SECURITY;

-- RLS policies for device_activity
CREATE POLICY "Caregivers can view device activity of their elderly profiles"
ON public.device_activity
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM elderly_profiles
    WHERE elderly_profiles.id = device_activity.elderly_profile_id
    AND elderly_profiles.caregiver_id = auth.uid()
  )
);

-- Update handle_new_user function to assign default caregiver role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email
  );
  
  -- Assign default caregiver role to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'caregiver');
  
  RETURN NEW;
END;
$$;