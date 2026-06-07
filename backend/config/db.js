/* ==========================================================================
   NatureSip Database Connection & Query Coordinator
   ========================================================================== */
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Force DNS resolution to prefer IPv4 to avoid ENETUNREACH on environments (like Render)
// that lack IPv6 outbound routing while connecting to Supabase.
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Flag for mock database state
let isMock = false;

// Mock database storage in memory
const memoryDB = {
  users: [
    {
      id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      name: "Test User",
      email: "test@naturesip.com",
      password_hash: "$2a$10$9c3nB46jFjN69q3V2h4g5euu9xKx2D2K4Xqg6T6y6N1w0Z0v0e2K6", // Hashed "password123"
      created_at: new Date()
    }
  ],
  custom_juices: [],
  orders: [],
  quiz_results: [],
  products: [
    { id: "p1", sku: "NS-MANGO", name: "Alphonso Mango Royale", price: 24.99, image_url: "/images/mango_bottle.png", category: "Standard", is_active: true },
    { id: "p2", sku: "NS-ORANGE", name: "Nagpur Orange Burst", price: 22.99, image_url: "/images/orange_bottle.png", category: "Standard", is_active: true },
    { id: "p3", sku: "NS-MIXED", name: "Mixed Fruit Supreme", price: 26.99, image_url: "/images/mixed_fruit_bottle.png", category: "Standard", is_active: true },
    { id: "p4", sku: "NS-POM", name: "Pomegranate Power", price: 28.99, image_url: "/images/pomegranate_bottle.png", category: "Standard", is_active: true },
    { id: "p5", sku: "NS-WATER", name: "Watermelon Chill", price: 19.99, image_url: "/images/watermelon_bottle.png", category: "Standard", is_active: true },
    { id: "p6", sku: "NS-MATCHA", name: "Blueberry Matcha Spark", price: 29.99, image_url: "/images/blueberry_matcha_bottle.png", category: "Premium", is_active: true },
    { id: "p7", sku: "NS-CUSTOM", name: "NatureSip Custom Blend", price: 29.99, image_url: "/images/custom_bottle.png", category: "Custom", is_active: true }
  ],
  inventory: [
    { product_id: "p1", stock_quantity: 100, low_stock_threshold: 10 },
    { product_id: "p2", stock_quantity: 80, low_stock_threshold: 10 },
    { product_id: "p3", stock_quantity: 120, low_stock_threshold: 15 },
    { product_id: "p4", stock_quantity: 50, low_stock_threshold: 5 },
    { product_id: "p5", stock_quantity: 150, low_stock_threshold: 20 },
    { product_id: "p6", stock_quantity: 0, low_stock_threshold: 5 }, // Out of stock to test validation
    { product_id: "p7", stock_quantity: 500, low_stock_threshold: 10 }
  ],
  inventory_transactions: [],
  payments: [],
  audit_logs: [],
  addresses: [],
  reviews: [],
  order_items: [],
  email_logs: []
};



let pool = null;

try {
  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 30000,
      max: 5,
      idleTimeoutMillis: 10000,
      allowExitOnIdle: true
    });
  } else {
    console.warn("⚠️ No DATABASE_URL found in environment variables. Falling back to Mock DB.");
    isMock = true;
  }
} catch (err) {
  console.error("❌ Database initialization error:", err.message);
  isMock = true;
}

// Function to run schema and migrations
const runSchemaInit = async () => {
  if (isMock) return;
  try {
    // 1. Run Core schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log("⚡ PostgreSQL core tables initialized.");
    }

    // 2. Run all SQL migrations dynamically in alphabetical order
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    if (fs.existsSync(migrationsDir)) {
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
      
      for (const file of migrationFiles) {
        const migrationPath = path.join(migrationsDir, file);
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        await pool.query(migrationSql);
        console.log(`⚡ PostgreSQL migration '${file}' executed successfully.`);
      }
    }

    // 3. Auto-seed product catalog and inventory if empty
    const productCheck = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCheck.rows[0].count) === 0) {
      console.log("🌱 Database products table is empty. Seeding catalog...");
      
      const defaultProducts = [
        { id: 'a0f1b2c3-d4e5-4f6a-9b0c-1d2e3f4a5b6c', sku: "NS-MANGO", name: "Alphonso Mango Royale", price: 24.99, image_url: "/images/mango_bottle.png", category: "Standard" },
        { id: 'b1f2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', sku: "NS-ORANGE", name: "Nagpur Orange Burst", price: 22.99, image_url: "/images/orange_bottle.png", category: "Standard" },
        { id: 'c2f3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', sku: "NS-MIXED", name: "Mixed Fruit Supreme", price: 26.99, image_url: "/images/mixed_fruit_bottle.png", category: "Standard" },
        { id: 'd3f4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', sku: "NS-POM", name: "Pomegranate Power", price: 28.99, image_url: "/images/pomegranate_bottle.png", category: "Standard" },
        { id: 'e4f5e6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', sku: "NS-WATER", name: "Watermelon Chill", price: 19.99, image_url: "/images/watermelon_bottle.png", category: "Standard" },
        { id: 'f5f6e7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a', sku: "NS-MATCHA", name: "Blueberry Matcha Spark", price: 29.99, image_url: "/images/blueberry_matcha_bottle.png", category: "Premium" },
        { id: '06f7e8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a', sku: "NS-CUSTOM", name: "NatureSip Custom Blend", price: 29.99, image_url: "/images/custom_bottle.png", category: "Custom" }
      ];

      const defaultInventory = {
        "NS-MANGO": { qty: 100, threshold: 10 },
        "NS-ORANGE": { qty: 80, threshold: 10 },
        "NS-MIXED": { qty: 120, threshold: 15 },
        "NS-POM": { qty: 50, threshold: 5 },
        "NS-WATER": { qty: 150, threshold: 20 },
        "NS-MATCHA": { qty: 0, threshold: 5 },
        "NS-CUSTOM": { qty: 500, threshold: 10 }
      };

      for (const prod of defaultProducts) {
        await pool.query(
          'INSERT INTO products (id, sku, name, price, image_url, category, is_active) VALUES ($1, $2, $3, $4, $5, $6, true)',
          [prod.id, prod.sku, prod.name, prod.price, prod.image_url, prod.category]
        );
        const inv = defaultInventory[prod.sku];
        await pool.query(
          'INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold) VALUES ($1, $2, $3)',
          [prod.id, inv.qty, inv.threshold]
        );
      }
      console.log("🌱 Seed database completed successfully.");
    }
  } catch (err) {
    console.error("❌ Schema initialization failed. Switching to Mock DB fallback. Error:", err.message);
    isMock = true;
  }
};

// Test connection
if (!isMock && pool) {
  pool.connect()
    .then(async (client) => {
      console.log("🔌 Connected to PostgreSQL database successfully.");
      client.release();
      await runSchemaInit();
    })
    .catch((err) => {
      console.error("⚠️ Failed to reach PostgreSQL server. Using in-memory fallback simulator. Reason:", err.message);
      isMock = true;
    });
}

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Core query coordinator function
export const query = async (text, params = []) => {
  const start = Date.now();
  if (!isMock && pool) {
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log(`[DB Query] Duration: ${duration}ms | SQL: ${text.substring(0, 80)}...`);
      return res;
    } catch (err) {
      const duration = Date.now() - start;
      console.error(`[DB Query Error] Failed after ${duration}ms: ${err.message}`);
      throw err;
    }
  }

  // Virtual DB Query Parser for in-memory simulator
  const queryStr = text.toLowerCase().trim();
  
  // 1. SELECT User by Email or ID
  if (queryStr.includes('select') && queryStr.includes('users')) {
    if (queryStr.includes('email =')) {
      const emailParam = params[0].toLowerCase();
      const user = memoryDB.users.find(u => u.email.toLowerCase() === emailParam);
      return { rows: user ? [user] : [] };
    }
    if (queryStr.includes('id =') || queryStr.includes('id = $1')) {
      const idParam = params[0];
      const user = memoryDB.users.find(u => u.id === idParam);
      return { rows: user ? [user] : [] };
    }
  }

  // 2. INSERT User registration
  if (queryStr.includes('insert into users')) {
    const [name, email, password_hash] = params;
    if (memoryDB.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      const err = new Error('duplicate key value violates unique constraint "users_email_key"');
      err.code = '23505';
      throw err;
    }
    const newUser = { id: generateUUID(), name, email, password_hash, created_at: new Date() };
    memoryDB.users.push(newUser);
    return { rows: [newUser] };
  }

  // 3. INSERT Custom Juice recipe
  if (queryStr.includes('insert into custom_juices')) {
    const [user_id, blend_name, ingredients, color_rgb] = params;
    const newJuice = {
      id: generateUUID(),
      user_id,
      blend_name,
      ingredients: typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients,
      color_rgb,
      created_at: new Date()
    };
    memoryDB.custom_juices.push(newJuice);
    return { rows: [newJuice] };
  }

  // 4. INSERT Pre-order
  if (queryStr.includes('insert into orders')) {
    const [user_id, name, email, flavor_preference, custom_juice_id] = params;
    const newOrder = {
      id: generateUUID(),
      user_id,
      name,
      email,
      flavor_preference,
      custom_juice_id,
      status: 'pending',
      created_at: new Date()
    };
    memoryDB.orders.push(newOrder);
    return { rows: [newOrder] };
  }

  // 5. SELECT User's Orders history
  if (queryStr.includes('select') && queryStr.includes('orders') && queryStr.includes('user_id =')) {
    const userId = params[0];
    const orders = memoryDB.orders.filter(o => o.user_id === userId);
    const populatedOrders = orders.map(o => {
      let custom_juice = null;
      if (o.custom_juice_id) {
        custom_juice = memoryDB.custom_juices.find(j => j.id === o.custom_juice_id) || null;
      }
      return { ...o, custom_juice };
    });
    return { rows: populatedOrders };
  }

  // 5a. SELECT User's custom juices
  if (queryStr.includes('select') && queryStr.includes('custom_juices') && queryStr.includes('user_id =')) {
    const userId = params[0];
    const juices = memoryDB.custom_juices.filter(j => j.user_id === userId);
    return { rows: juices };
  }

  // 5b. SELECT User's saved addresses
  if (queryStr.includes('select') && queryStr.includes('addresses') && queryStr.includes('user_id =')) {
    const userId = params[0];
    const addresses = memoryDB.addresses.filter(a => a.user_id === userId);
    return { rows: addresses };
  }

  // 5c. INSERT saved address
  if (queryStr.includes('insert into addresses')) {
    const [user_id, street, city, state, postal_code, country, address_type, is_default] = params;
    const newAddress = {
      id: generateUUID(),
      user_id,
      street,
      city,
      state,
      postal_code,
      country,
      address_type,
      is_default: is_default === true,
      created_at: new Date()
    };
    memoryDB.addresses.push(newAddress);
    return { rows: [newAddress] };
  }

  // 5d. UPDATE saved address
  if (queryStr.includes('update addresses')) {
    const [street, city, state, postal_code, country, address_type, is_default, id, user_id] = params;
    const idx = memoryDB.addresses.findIndex(a => a.id === id && a.user_id === user_id);
    if (idx !== -1) {
      memoryDB.addresses[idx] = {
        ...memoryDB.addresses[idx],
        street,
        city,
        state,
        postal_code,
        country,
        address_type,
        is_default: is_default === true
      };
      return { rows: [memoryDB.addresses[idx]] };
    }
    return { rows: [] };
  }

  // 5e. DELETE saved address
  if (queryStr.includes('delete from addresses')) {
    const [id, user_id] = params;
    const idx = memoryDB.addresses.findIndex(a => a.id === id && a.user_id === user_id);
    if (idx !== -1) {
      memoryDB.addresses.splice(idx, 1);
      return { rows: [] };
    }
    return { rows: [] };
  }

  // 5f. SELECT product reviews
  if (queryStr.includes('select') && queryStr.includes('reviews') && queryStr.includes('product_id =')) {
    const productId = params[0];
    const reviews = memoryDB.reviews.filter(r => r.product_id === productId);
    const populated = reviews.map(r => {
      const user = memoryDB.users.find(u => u.id === r.user_id);
      return {
        ...r,
        reviewer_name: user ? user.name : 'Anonymous User'
      };
    });
    return { rows: populated };
  }

  // 5g. INSERT product review
  if (queryStr.includes('insert into reviews')) {
    const [user_id, product_id, rating, comment] = params;
    // Handle ON CONFLICT by updating existing if matching user_id and product_id
    const existingIdx = memoryDB.reviews.findIndex(r => r.user_id === user_id && r.product_id === product_id);
    if (existingIdx !== -1) {
      memoryDB.reviews[existingIdx].rating = rating;
      memoryDB.reviews[existingIdx].comment = comment || null;
      memoryDB.reviews[existingIdx].created_at = new Date();
      return { rows: [memoryDB.reviews[existingIdx]] };
    } else {
      const newReview = {
        id: generateUUID(),
        user_id,
        product_id,
        rating,
        comment: comment || null,
        created_at: new Date()
      };
      memoryDB.reviews.push(newReview);
      return { rows: [newReview] };
    }
  }


  // 6. INSERT Quiz results
  if (queryStr.includes('insert into quiz_results')) {
    const [user_id, primary_recommendation, quiz_answers] = params;
    const newResult = {
      id: generateUUID(),
      user_id,
      primary_recommendation,
      quiz_answers: typeof quiz_answers === 'string' ? JSON.parse(quiz_answers) : quiz_answers,
      created_at: new Date()
    };
    memoryDB.quiz_results.push(newResult);
    return { rows: [newResult] };
  }

  // 6a. SELECT Quiz results history
  if (queryStr.includes('select') && queryStr.includes('quiz_results') && queryStr.includes('user_id =')) {
    const userId = params[0];
    const results = memoryDB.quiz_results.filter(qr => qr.user_id === userId);
    return { rows: results };
  }


  // 7. SELECT Products (Full list, by SKU, or by ID)
  if (queryStr.includes('select') && queryStr.includes('products')) {
    let list = [...memoryDB.products];
    // Populate stock value
    list = list.map(p => {
      const inv = memoryDB.inventory.find(i => i.product_id === p.id);
      return { ...p, stock: inv ? inv.stock_quantity : 0 };
    });

    if (queryStr.includes('sku =') || queryStr.includes('sku = $1')) {
      const skuParam = params[0].toUpperCase();
      const product = list.find(p => p.sku === skuParam);
      return { rows: product ? [product] : [] };
    }
    if (queryStr.includes('id =') || queryStr.includes('id = $1') || queryStr.includes('p.id = $1')) {
      const idParam = params[0];
      const product = list.find(p => p.id === idParam);
      return { rows: product ? [product] : [] };
    }
    // Filter active unless admin list (we can check if it has a condition or return all active by default)
    if (queryStr.includes('is_active = true') || !queryStr.includes('where')) {
      return { rows: list.filter(p => p.is_active) };
    }
    return { rows: list };
  }

  // 8. SELECT Inventory for Product
  if (queryStr.includes('select') && queryStr.includes('inventory') && queryStr.includes('product_id =')) {
    const prodId = params[0];
    const item = memoryDB.inventory.find(i => i.product_id === prodId);
    return { rows: item ? [item] : [] };
  }

  // 9. UPDATE Inventory Quantity
  if (queryStr.includes('update') && queryStr.includes('inventory') && queryStr.includes('stock_quantity =')) {
    const [qty, prodId] = params;
    const item = memoryDB.inventory.find(i => i.product_id === prodId);
    if (item) {
      item.stock_quantity = qty;
      return { rows: [item] };
    }
    return { rows: [] };
  }

  // 10. INSERT Inventory Transactions log
  if (queryStr.includes('insert into inventory_transactions')) {
    const [product_id, transaction_type, quantity, reference_id] = params;
    const newTx = { id: generateUUID(), product_id, transaction_type, quantity, reference_id, created_at: new Date() };
    memoryDB.inventory_transactions.push(newTx);
    return { rows: [newTx] };
  }

  // 11. INSERT Payments log
  if (queryStr.includes('insert into payments')) {
    const [order_id, provider_transaction_id, amount, currency, status, provider, webhook_payload] = params;
    const newPayment = {
      id: generateUUID(),
      order_id,
      provider_transaction_id,
      amount,
      currency,
      status,
      provider,
      webhook_payload: typeof webhook_payload === 'string' ? JSON.parse(webhook_payload) : webhook_payload,
      created_at: new Date(),
      updated_at: new Date()
    };
    memoryDB.payments.push(newPayment);
    return { rows: [newPayment] };
  }

  // 12. UPDATE Payment status
  if (queryStr.includes('update') && queryStr.includes('payments') && queryStr.includes('status =')) {
    const [status, txId] = params;
    const payment = memoryDB.payments.find(p => p.provider_transaction_id === txId);
    if (payment) {
      payment.status = status;
      payment.updated_at = new Date();
      return { rows: [payment] };
    }
    return { rows: [] };
  }

  // 13. INSERT Audit Logs
  if (queryStr.includes('insert into audit_logs')) {
    const [user_id, action, entity_affected, details, ip_address] = params;
    const newAudit = {
      id: generateUUID(),
      user_id,
      action,
      entity_affected,
      details: typeof details === 'string' ? JSON.parse(details) : details,
      ip_address,
      created_at: new Date()
    };
    memoryDB.audit_logs.push(newAudit);
    return { rows: [newAudit] };
  }

  // 13a. INSERT Email Logs
  if (queryStr.includes('insert into email_logs')) {
    const [recipient, subject, status, error_message] = params;
    const newEmailLog = {
      id: generateUUID(),
      recipient,
      subject,
      status,
      error_message: error_message || null,
      sent_at: new Date()
    };
    memoryDB.email_logs.push(newEmailLog);
    return { rows: [newEmailLog] };
  }


  // 14. INSERT Products
  if (queryStr.includes('insert into products')) {
    const [sku, name, description, price, image_url, category, flavor, is_active] = params;
    // Check duplicate SKU
    if (memoryDB.products.some(p => p.sku === sku.toUpperCase())) {
      const err = new Error('duplicate key value violates unique constraint "products_sku_key"');
      err.code = '23505';
      throw err;
    }
    const newProduct = {
      id: generateUUID(),
      sku: sku.toUpperCase(),
      name,
      description,
      price: parseFloat(price),
      image_url,
      category,
      flavor,
      is_active: is_active !== false,
      created_at: new Date(),
      updated_at: new Date()
    };
    memoryDB.products.push(newProduct);
    return { rows: [newProduct] };
  }

  // 15. INSERT Inventory
  if (queryStr.includes('insert into inventory')) {
    const [product_id, stock_quantity, low_stock_threshold] = params;
    const newInv = {
      product_id,
      stock_quantity: parseInt(stock_quantity) || 0,
      low_stock_threshold: parseInt(low_stock_threshold) || 10,
      updated_at: new Date()
    };
    memoryDB.inventory.push(newInv);
    return { rows: [newInv] };
  }

  // 16. UPDATE Products
  if (queryStr.includes('update products') || (queryStr.includes('update') && queryStr.includes('products') && !queryStr.includes('inventory'))) {
    const [sku, name, description, price, image_url, category, flavor, is_active, id] = params;
    // Check duplicate SKU if it changed
    const duplicate = memoryDB.products.find(p => p.sku === sku.toUpperCase() && p.id !== id);
    if (duplicate) {
      const err = new Error('duplicate key value violates unique constraint "products_sku_key"');
      err.code = '23505';
      throw err;
    }
    const idx = memoryDB.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      memoryDB.products[idx] = {
        ...memoryDB.products[idx],
        sku: sku.toUpperCase(),
        name,
        description,
        price: parseFloat(price),
        image_url,
        category,
        flavor,
        is_active: is_active !== false,
        updated_at: new Date()
      };
      return { rows: [memoryDB.products[idx]] };
    }
    return { rows: [] };
  }

  // 17. DELETE Products
  if (queryStr.includes('delete from products')) {
    const id = params[0];
    const idx = memoryDB.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      const deleted = memoryDB.products.splice(idx, 1)[0];
      // cascade delete inventory
      const invIdx = memoryDB.inventory.findIndex(i => i.product_id === id);
      if (invIdx !== -1) memoryDB.inventory.splice(invIdx, 1);
      return { rows: [deleted] };
    }
    return { rows: [] };
  }

  // 18. SELECT from carts
  if (queryStr.includes('select') && queryStr.includes('carts') && queryStr.includes('user_id =')) {
    const userId = params[0];
    const cart = memoryDB.carts.find(c => c.user_id === userId);
    return { rows: cart ? [cart] : [] };
  }

  // 19. INSERT into carts
  if (queryStr.includes('insert into carts')) {
    const userId = params[0];
    const newCart = { id: generateUUID(), user_id: userId, created_at: new Date(), updated_at: new Date() };
    memoryDB.carts.push(newCart);
    return { rows: [newCart] };
  }

  // 20. SELECT from cart_items
  if (queryStr.includes('select') && queryStr.includes('cart_items')) {
    // Check if query is by cart_id and product_id
    if (queryStr.includes('cart_id =') && (queryStr.includes('product_id =') || queryStr.includes('product_id = $2'))) {
      const [cartId, productId] = params;
      const item = memoryDB.cart_items.find(i => i.cart_id === cartId && i.product_id === productId);
      return { rows: item ? [item] : [] };
    }
    // Check if query is by id
    if (queryStr.includes('id =') || queryStr.includes('id = $1') || queryStr.includes('ci.id =')) {
      const id = params[0];
      const item = memoryDB.cart_items.find(i => i.id === id);
      return { rows: item ? [item] : [] };
    }
    // List for cart_id
    if (queryStr.includes('cart_id =')) {
      const cartId = params[0];
      const items = memoryDB.cart_items.filter(i => i.cart_id === cartId);
      const populated = items.map(item => {
        const product = memoryDB.products.find(p => p.id === item.product_id);
        const custom_juice = item.custom_juice_id ? memoryDB.custom_juices.find(cj => cj.id === item.custom_juice_id) : null;
        return {
          ...item,
          name: product ? product.name : (custom_juice ? custom_juice.blend_name : 'NatureSip Custom Blend'),
          price: product ? parseFloat(product.price) : 29.99,
          sku: product ? product.sku : 'NS-CUSTOM',
          image_url: product ? product.image_url : '/images/custom_bottle.png',
          blend_name: custom_juice ? custom_juice.blend_name : null
        };
      });
      return { rows: populated };
    }
  }

  // 21. INSERT into cart_items
  if (queryStr.includes('insert into cart_items')) {
    const [cart_id, product_id, custom_juice_id, quantity] = params;
    const newItem = {
      id: generateUUID(),
      cart_id,
      product_id,
      custom_juice_id,
      quantity: parseInt(quantity) || 1,
      created_at: new Date()
    };
    memoryDB.cart_items.push(newItem);
    return { rows: [newItem] };
  }

  // 22. UPDATE cart_items
  if (queryStr.includes('update cart_items') || (queryStr.includes('update') && queryStr.includes('cart_items'))) {
    const [quantity, id] = params;
    const idx = memoryDB.cart_items.findIndex(i => i.id === id);
    if (idx !== -1) {
      memoryDB.cart_items[idx].quantity = parseInt(quantity);
      return { rows: [memoryDB.cart_items[idx]] };
    }
    return { rows: [] };
  }

  // 23. DELETE from cart_items
  if (queryStr.includes('delete from cart_items')) {
    // Delete all items for a cart (empty cart)
    if (queryStr.includes('cart_id =')) {
      const cartId = params[0];
      memoryDB.cart_items = memoryDB.cart_items.filter(i => i.cart_id !== cartId);
      return { rows: [] };
    }
    // Delete single item by id
    const id = params[0];
    const idx = memoryDB.cart_items.findIndex(i => i.id === id);
    if (idx !== -1) {
      const deleted = memoryDB.cart_items.splice(idx, 1)[0];
      return { rows: [deleted] };
    }
    return { rows: [] };
  }

  return { rows: [] };
};

// Check if currently operating on mock fallback database state
export const isMockEnabled = () => isMock;
export const getMemoryDB = () => memoryDB;
