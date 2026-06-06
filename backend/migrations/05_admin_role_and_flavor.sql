-- NatureSip Admin Role & Product Flavor Migration

-- 1. Add columns if they do not exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS flavor VARCHAR(100);

-- 2. Set test user to admin for verification
UPDATE users SET is_admin = true WHERE email = 'test@naturesip.com';

-- 3. Update existing standard products flavor columns
UPDATE products SET flavor = 'mango' WHERE sku = 'NS-MANGO';
UPDATE products SET flavor = 'orange' WHERE sku = 'NS-ORANGE';
UPDATE products SET flavor = 'mixed' WHERE sku = 'NS-MIXED';
UPDATE products SET flavor = 'pomegranate' WHERE sku = 'NS-POM';
UPDATE products SET flavor = 'watermelon' WHERE sku = 'NS-WATER';
UPDATE products SET flavor = 'matcha' WHERE sku = 'NS-MATCHA';
UPDATE products SET flavor = 'custom' WHERE sku = 'NS-CUSTOM';
