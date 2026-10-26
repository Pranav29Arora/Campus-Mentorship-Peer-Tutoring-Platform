-- Migration: Fix NULL tokens in auth.users and ensure GoTrue compatibility
-- Prevents: "Scan error on column index 3, name \"confirmation_token\": converting NULL to string is unsupported"

-- 1. Ensure all token fields in auth.users are empty strings, not NULL
UPDATE auth.users
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  reauthentication_token = COALESCE(reauthentication_token, '');

-- 2. Update column defaults in auth.users
ALTER TABLE auth.users 
  ALTER COLUMN confirmation_token SET DEFAULT '',
  ALTER COLUMN recovery_token SET DEFAULT '',
  ALTER COLUMN email_change_token_new SET DEFAULT '',
  ALTER COLUMN email_change SET DEFAULT '';

-- 3. Update public.users -> auth.users insertion trigger to supply empty string tokens
CREATE OR REPLACE FUNCTION public.handle_sync_user_to_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
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
      '',
      '',
      '',
      '',
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
$function$;
