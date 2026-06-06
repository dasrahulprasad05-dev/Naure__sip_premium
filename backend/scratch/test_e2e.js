/* ==========================================================================
   NatureSip E2E Backend Integration Test Script
   ========================================================================== */

const API_URL = 'http://localhost:5000/api';
const TEST_EMAIL = `test_e2e_${Date.now()}@example.com`;
const TEST_PASS = 'Password123!';

async function runTests() {
  console.log("🚀 Starting NatureSip End-to-End Integration Test...");
  let token = '';
  let userId = '';
  let productId = '';
  let itemId = '';

  try {
    // 1. Register User
    console.log("\n1️⃣ Registering User...");
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'E2E Test User',
        email: TEST_EMAIL,
        password: TEST_PASS
      })
    });
    const regData = await regRes.json();
    console.log("Response status:", regRes.status);
    console.log("Response body:", regData);
    if (regRes.status !== 201) throw new Error("Registration failed");
    token = regData.token;
    userId = regData.user.id;

    // 2. Login User
    console.log("\n2️⃣ Logging in User...");
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASS
      })
    });
    const loginData = await loginRes.json();
    console.log("Response status:", loginRes.status);
    console.log("Response body:", loginData);
    if (loginRes.status !== 200) throw new Error("Login failed");

    // 3. Get Product List
    console.log("\n3️⃣ Fetching Product List...");
    const prodRes = await fetch(`${API_URL}/products`);
    const prodData = await prodRes.json();
    console.log("Response status:", prodRes.status);
    console.log("Products count:", prodData.count);
    if (prodRes.status !== 200) throw new Error("Product fetch failed");
    
    // Select the first product (e.g. Alphonso Mango Royale) for the cart test
    const targetProduct = prodData.products[0];
    productId = targetProduct.id;
    console.log(`Selected Product: ${targetProduct.name} (ID: ${productId}, SKU: ${targetProduct.sku}, Price: ${targetProduct.price}, Stock: ${targetProduct.stock})`);

    // 4. Add Product to Cart
    console.log("\n4️⃣ Adding Product to Cart...");
    const addRes = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: 2
      })
    });
    const addData = await addRes.json();
    console.log("Response status:", addRes.status);
    console.log("Response body:", addData);
    if (addRes.status !== 201) throw new Error("Add to cart failed");
    itemId = addData.item.id;

    // 5. Update Cart Quantity
    console.log("\n5️⃣ Updating Cart Item Quantity...");
    const updateRes = await fetch(`${API_URL}/cart/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        quantity: 5
      })
    });
    const updateData = await updateRes.json();
    console.log("Response status:", updateRes.status);
    console.log("Response body:", updateData);
    if (updateRes.status !== 200) throw new Error("Update cart failed");

    // 6. Retrieve Cart & Verify Calculations
    console.log("\n6️⃣ Retrieving Cart & Verifying Calculations...");
    const cartRes = await fetch(`${API_URL}/cart`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const cartData = await cartRes.json();
    console.log("Response status:", cartRes.status);
    console.log("Cart Body:", cartData);
    if (cartRes.status !== 200) throw new Error("Retrieve cart failed");
    
    const expectedSubtotal = parseFloat((parseFloat(targetProduct.price) * 5).toFixed(2));
    const actualSubtotal = cartData.cart.subtotal;
    const actualTotalItems = cartData.cart.total_items;
    
    console.log(`Assertion: Expected Subtotal = $${expectedSubtotal}, Actual Subtotal = $${actualSubtotal}`);
    console.log(`Assertion: Expected Item Count = 5, Actual Item Count = ${actualTotalItems}`);
    
    if (actualSubtotal !== expectedSubtotal || actualTotalItems !== 5) {
      console.log("❌ Cart calculations are incorrect!");
    } else {
      console.log("✅ Cart calculations match perfectly!");
    }

    // 7. Create Order from Cart
    console.log("\n7️⃣ Attempting to Create Order from Cart...");
    const orderRes = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'E2E Test User',
        email: TEST_EMAIL,
        flavor_preference: 'mango' // Currently the backend only supports single-flavor orders
      })
    });
    const orderData = await orderRes.json();
    console.log("Response status:", orderRes.status);
    console.log("Response body:", orderData);
    
    console.log("\n⚠️ CHECKPOINT RESULT: The backend currently only supports creating an order for a single flavor preference (MVP mode). It does not checkout from the shopping cart yet, which is a major missing integration!");

    // 8. Test Stock Validation (Try to add quantity exceeding inventory)
    console.log("\n8️⃣ Testing Stock Validation (Adding excessive quantity)...");
    const stockRes = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: 1000 // Exceeds Nagpur/Alphonso stock limit
      })
    });
    const stockData = await stockRes.json();
    console.log("Response status:", stockRes.status);
    console.log("Response body:", stockData);
    if (stockRes.status === 400) {
      console.log("✅ Stock validation prevented excess items successfully!");
    } else {
      console.log("❌ Stock validation failed to block excess items!");
    }

    // 9. Test Security Access (Try to read cart using invalid token)
    console.log("\n9️⃣ Testing Security (Accessing cart with invalid token)...");
    const secRes = await fetch(`${API_URL}/cart`, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer invalid_token' }
    });
    console.log("Response status:", secRes.status);
    if (secRes.status === 401) {
      console.log("✅ Security block successful for invalid token!");
    } else {
      console.log("❌ Security failed to block unauthorized request!");
    }

    console.log("\n🎉 Integration Test Run Complete.");
  } catch (err) {
    console.error("❌ E2E Test execution failed with error:", err.message);
  }
}

runTests();
