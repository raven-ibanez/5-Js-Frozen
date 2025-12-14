-- Make payment method fields optional to support Cash on Delivery
ALTER TABLE payment_methods 
ALTER COLUMN account_number DROP NOT NULL,
ALTER COLUMN account_name DROP NOT NULL,
ALTER COLUMN qr_code_url DROP NOT NULL;

-- Seed Cash on Delivery payment method
INSERT INTO payment_methods (id, name, active, sort_order)
VALUES ('cash-on-delivery', 'Cash on Delivery', true, 99)
ON CONFLICT (id) DO NOTHING;
