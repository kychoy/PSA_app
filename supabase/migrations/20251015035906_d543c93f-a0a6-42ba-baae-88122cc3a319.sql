-- Change preferred_alert_method to support multiple methods
ALTER TABLE contacts 
DROP COLUMN preferred_alert_method;

-- Add new column for multiple alert methods
ALTER TABLE contacts 
ADD COLUMN alert_methods alert_method[] NOT NULL DEFAULT ARRAY['email']::alert_method[];