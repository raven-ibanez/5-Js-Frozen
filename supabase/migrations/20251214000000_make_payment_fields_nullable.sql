-- Make payment method fields optional to support Cash on Delivery
ALTER TABLE payment_methods 
ALTER COLUMN account_number DROP NOT NULL,
ALTER COLUMN account_name DROP NOT NULL,
ALTER COLUMN qr_code_url DROP NOT NULL;
