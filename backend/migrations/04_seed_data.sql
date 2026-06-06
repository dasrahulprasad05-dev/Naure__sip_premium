-- NatureSip Production Sample Seed Data

-- 0. Create a Mock Test User if it does not exist (needed for addresses and reviews foreign keys)
INSERT INTO users (id, name, email, password_hash)
VALUES ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Test User', 'test@naturesip.com', '$2a$10$9c3nB46jFjN69q3V2h4g5euu9xKx2D2K4Xqg6T6y6N1w0Z0v0e2K6')
ON CONFLICT (id) DO NOTHING;

-- 1. Populate Product Catalog Descriptions
UPDATE products SET description = 'A luxury blend of cold-pressed organic Alphonso mangoes, raw coconut water, and a dash of turmeric for natural immunity.' WHERE sku = 'NS-MANGO';
UPDATE products SET description = 'Crisp, pulpy citrus burst made from hand-harvested Nagpur oranges, rich in Vitamin C, flavonoids, and natural energy.' WHERE sku = 'NS-ORANGE';
UPDATE products SET description = 'An antioxidant powerhouse blending sweet forest berries, red apple slices, orange wedges, and organic mango nectar.' WHERE sku = 'NS-MIXED';
UPDATE products SET description = 'Rich cold-pressed pomegranate seed extract filled with polyphenols and natural electrolytes for heart health and post-exercise recovery.' WHERE sku = 'NS-POM';
UPDATE products SET description = 'Ultra-hydrating organic watermelon juice infused with fresh peppermint leaves and L-Citrulline to flush fatigue.' WHERE sku = 'NS-WATER';
UPDATE products SET description = 'A mindfulness drink blending ceremonial-grade Japanese Uji Matcha, sweet blueberries, and lavender to enhance stress relief.' WHERE sku = 'NS-MATCHA';
UPDATE products SET description = 'A custom-tailored blend crafted using your personal flavor profile and wellness recommendations.' WHERE sku = 'NS-CUSTOM';

-- 2. Populate Product Gallery Images (product_images table)
-- Alphonso Mango Royale
INSERT INTO product_images (product_id, url, display_order, is_primary) 
VALUES ('a0f1b2c3-d4e5-4f6a-9b0c-1d2e3f4a5b6c', '/images/mango_bottle.png', 1, true)
ON CONFLICT DO NOTHING;
INSERT INTO product_images (product_id, url, display_order, is_primary) 
VALUES ('a0f1b2c3-d4e5-4f6a-9b0c-1d2e3f4a5b6c', '/images/mango_pack.png', 2, false)
ON CONFLICT DO NOTHING;

-- Nagpur Orange Burst
INSERT INTO product_images (product_id, url, display_order, is_primary) 
VALUES ('b1f2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '/images/orange_bottle.png', 1, true)
ON CONFLICT DO NOTHING;

-- Mixed Fruit Supreme
INSERT INTO product_images (product_id, url, display_order, is_primary) 
VALUES ('c2f3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', '/images/mixed_fruit_bottle.png', 1, true)
ON CONFLICT DO NOTHING;

-- Pomegranate Power
INSERT INTO product_images (product_id, url, display_order, is_primary) 
VALUES ('d3f4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', '/images/pomegranate_bottle.png', 1, true)
ON CONFLICT DO NOTHING;

-- Watermelon Chill
INSERT INTO product_images (product_id, url, display_order, is_primary) 
VALUES ('e4f5e6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', '/images/watermelon_bottle.png', 1, true)
ON CONFLICT DO NOTHING;

-- Blueberry Matcha Spark
INSERT INTO product_images (product_id, url, display_order, is_primary) 
VALUES ('f5f6e7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a', '/images/blueberry_matcha_bottle.png', 1, true)
ON CONFLICT DO NOTHING;

-- Custom Blend
INSERT INTO product_images (product_id, url, display_order, is_primary) 
VALUES ('06f7e8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a', '/images/custom_bottle.png', 1, true)
ON CONFLICT DO NOTHING;


-- 3. Populate Sample User Addresses (addresses table for test user)
-- Mock user: test@naturesip.com (ID: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d)
INSERT INTO addresses (user_id, street, city, state, postal_code, country, address_type, is_default)
VALUES ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '123 Wellness Boulevard', 'Los Angeles', 'CA', '90001', 'United States', 'shipping', true)
ON CONFLICT DO NOTHING;

INSERT INTO addresses (user_id, street, city, state, postal_code, country, address_type, is_default)
VALUES ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '123 Wellness Boulevard', 'Los Angeles', 'CA', '90001', 'United States', 'billing', true)
ON CONFLICT DO NOTHING;


-- 4. Populate Sample Product Reviews (reviews table)
-- Review on Mango Royale
INSERT INTO reviews (user_id, product_id, rating, comment)
VALUES ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'a0f1b2c3-d4e5-4f6a-9b0c-1d2e3f4a5b6c', 5, 'Absolutely delicious! Tastes like real Alphonso mangoes without being overly sweet.')
ON CONFLICT (user_id, product_id) DO NOTHING;

-- Review on Nagpur Orange Burst
INSERT INTO reviews (user_id, product_id, rating, comment)
VALUES ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'b1f2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 4, 'Very refreshing citrus tang, perfect for morning boost. Reordered twice already.')
ON CONFLICT (user_id, product_id) DO NOTHING;


-- 5. Populate Communication Seeds (Subscribers & Contact Form messages)
INSERT INTO newsletter_subscribers (email, is_active)
VALUES ('newsletter1@example.com', true)
ON CONFLICT (email) DO NOTHING;
INSERT INTO newsletter_subscribers (email, is_active)
VALUES ('newsletter2@example.com', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO contact_messages (name, email, subject, message, status)
VALUES ('John Doe', 'john.doe@example.com', 'Wholesale Inquiry', 'Hello, do you offer corporate catering or wholesale bulk rates for NatureSip packs?', 'unread')
ON CONFLICT DO NOTHING;
INSERT INTO contact_messages (name, email, subject, message, status)
VALUES ('Alice Smith', 'alice@example.com', 'Ingredient Question', 'Is the Blueberry Matcha Spark completely vegan and gluten-free?', 'unread')
ON CONFLICT DO NOTHING;
