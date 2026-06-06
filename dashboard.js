/* ==========================================================================
   NatureSip Premium Customer Dashboard Portal
   ========================================================================== */
import { initAuth, showToast } from './auth.js';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://naure-sip-premium.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Auth module
  initAuth();

  // 2. Auth State Check & Redirections
  const checkAuth = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const token = localStorage.getItem('token');

    if (!currentUser || !token) {
      showToast("Redirecting to homepage. Sign in required to access portal.");
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
      return false;
    }

    // Populate Sidebar Profile Header Details
    const profileNameEl = document.getElementById('profile-name');
    const profileEmailEl = document.getElementById('profile-email');
    if (profileNameEl) profileNameEl.innerText = currentUser.name;
    if (profileEmailEl) profileEmailEl.innerText = currentUser.email;

    return true;
  };

  // Intercept authentication shifts to kick guest users out of dashboard
  window.onAuthChange = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      window.location.href = 'index.html';
    }
  };

  if (!checkAuth()) return;

  // Preloader Screen Dismissal
  const dismissPreloader = () => {
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (progressBar) progressBar.style.width = '100%';
    if (progressText) progressText.innerText = '100%';
    
    setTimeout(() => {
      if (preloader) preloader.classList.add('fade-out');
    }, 400);
  };

  // 3. Global Dashboard States
  let currentEditingAddressId = null;

  // 4. Tab Navigation Router
  const tabBtns = document.querySelectorAll('.db-tab-btn');
  const tabPanels = document.querySelectorAll('.db-tab-panel');

  const switchTab = (tabId) => {
    // Toggles button active states
    tabBtns.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Toggles panel visibility
    tabPanels.forEach(panel => {
      if (panel.id === `tab-${tabId}`) {
        panel.classList.remove('hide');
      } else {
        panel.classList.add('hide');
      }
    });

    // Trigger specific endpoint loaders
    switch (tabId) {
      case 'orders':
        loadOrdersHistory();
        break;
      case 'addresses':
        loadAddressBook();
        break;
      case 'blends':
        loadCustomBlends();
        break;
      case 'wellness':
        loadWellnessProfile();
        break;
    }
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Default Boot: Load Orders Tab
  switchTab('orders');

  // Helper: Get Request Headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // ==========================================================================
  // TAB A: Orders pre-orders tracking list loader
  // ==========================================================================
  async function loadOrdersHistory() {
    const container = document.getElementById('orders-list');
    if (!container) return;

    container.innerHTML = `
      <div class="loading-state">
        <span class="loading-spinner">⏳</span>
        <p>Retrieving orders history...</p>
      </div>
    `;

    try {
      const response = await fetch(`${API_URL}/orders`, { headers: getAuthHeaders() });
      const data = await response.json();

      if (data.status !== 'success' || !data.orders || data.orders.length === 0) {
        container.innerHTML = `
          <div class="empty-tab-state">
            <span class="empty-icon">📦</span>
            <h4>No Orders Found</h4>
            <p>You have not placed any pre-orders yet. Start crafting your fresh juice and secure your shipment!</p>
            <a href="index.html#preorder" class="btn btn-primary btn-sm">Order Standard Flavor</a>
            <a href="builder.html" class="btn btn-secondary btn-sm" style="margin-left:8px;">Craft Custom Blend</a>
          </div>
        `;
        dismissPreloader();
        return;
      }

      container.innerHTML = ''; // Clear spinner

      data.orders.forEach(order => {
        const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        });

        // Determine current status indexing for timeline representation
        const statusMap = { 'pending': 0, 'processing': 1, 'shipped': 2, 'delivered': 3 };
        const currentStatusIndex = statusMap[order.status.toLowerCase()] !== undefined ? statusMap[order.status.toLowerCase()] : 0;
        const steps = ['Pre-ordered', 'Processing', 'Shipped', 'Delivered'];

        // Build items list representation
        let flavorHtml = '';
        if (order.flavor_preference.toLowerCase() === 'custom' && order.custom_juice) {
          flavorHtml = `<strong>Custom Formula:</strong> "${order.custom_juice.blend_name}"`;
        } else {
          const formattedFlavor = order.flavor_preference
            .replace('NS-', '')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          flavorHtml = `<strong>Flavor:</strong> ${formattedFlavor}`;
        }

        // Timeline html assembly
        let timelineStepsHtml = '';
        steps.forEach((step, idx) => {
          let stepClass = '';
          if (idx < currentStatusIndex) stepClass = 'completed';
          else if (idx === currentStatusIndex) stepClass = 'active';
          
          timelineStepsHtml += `
            <div class="timeline-step ${stepClass}">
              <div class="step-dot">${idx + 1}</div>
              <span class="step-label">${step}</span>
            </div>
          `;
        });

        const totalValue = order.total_amount ? parseFloat(order.total_amount).toFixed(2) : '29.99';

        const card = document.createElement('div');
        card.className = 'order-card-wrapper glass-card';
        card.innerHTML = `
          <div class="order-card-header">
            <div class="order-id-group">
              <span class="meta-label">ORDER ID</span>
              <span class="order-id-text">${order.id}</span>
            </div>
            <div class="order-header-meta">
              <div class="meta-item">
                <span class="meta-label">PLACED ON</span>
                <span class="meta-val">${orderDate}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">TOTAL AMOUNT</span>
                <span class="meta-val text-accent">$${totalValue}</span>
              </div>
            </div>
          </div>
          
          <div class="order-card-body">
            <div class="order-details-info">
              <span class="details-juice-tag">🌿 6-Pack Premium Bottled Juice</span>
              <p class="details-preference">${flavorHtml}</p>
              <p class="details-recipient"><strong>Recipient:</strong> ${order.name} (${order.email})</p>
            </div>
            
            <!-- Tracking Timeline -->
            <div class="order-tracking-timeline-container">
              <div class="timeline-track-bar">
                <div class="timeline-fill-bar" style="width: ${(currentStatusIndex / 3) * 100}%"></div>
              </div>
              <div class="timeline-steps-wrapper">
                ${timelineStepsHtml}
              </div>
            </div>
          </div>
        `;
        container.appendChild(card);
      });

      dismissPreloader();
    } catch (err) {
      console.error(err);
      container.innerHTML = `
        <div class="error-state">
          <p>⚠️ Failed to fetch orders log history. Please refresh.</p>
        </div>
      `;
      dismissPreloader();
    }
  }

  // ==========================================================================
  // TAB B: Address book manager API + UI CRUD Lifecycle
  // ==========================================================================
  const addressFormModal = document.getElementById('address-form-modal');
  const addAddressBtn = document.getElementById('add-address-btn');
  const cancelAddressBtn = document.getElementById('cancel-address-btn');
  const addressInnerForm = document.getElementById('address-inner-form');
  const addressModalTitle = document.getElementById('address-modal-title');

  // Modal Open For Addition
  if (addAddressBtn) {
    addAddressBtn.addEventListener('click', () => {
      currentEditingAddressId = null;
      if (addressInnerForm) addressInnerForm.reset();
      if (addressModalTitle) addressModalTitle.innerText = "Add New Address";
      if (addressFormModal) addressFormModal.classList.remove('hide');
    });
  }

  // Modal Close
  const closeAddressModal = () => {
    if (addressFormModal) addressFormModal.classList.add('hide');
    if (addressInnerForm) addressInnerForm.reset();
    currentEditingAddressId = null;
  };

  if (cancelAddressBtn) {
    cancelAddressBtn.addEventListener('click', closeAddressModal);
  }

  // Submit Handler: Add / Update Address
  if (addressInnerForm) {
    addressInnerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const street = document.getElementById('addr-street').value.trim();
      const city = document.getElementById('addr-city').value.trim();
      const state = document.getElementById('addr-state').value.trim();
      const postal_code = document.getElementById('addr-zip').value.trim();
      const country = document.getElementById('addr-country').value.trim();
      const address_type = document.getElementById('addr-type').value;
      const is_default = document.getElementById('addr-default').checked;

      if (!street || !city || !state || !postal_code || !country) {
        showToast("Please fill all required address fields.");
        return;
      }

      const bodyData = { street, city, state, postal_code, country, address_type, is_default };

      try {
        let response;
        if (currentEditingAddressId) {
          // UPDATE (PUT)
          response = await fetch(`${API_URL}/addresses/${currentEditingAddressId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(bodyData)
          });
        } else {
          // CREATE (POST)
          response = await fetch(`${API_URL}/addresses`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(bodyData)
          });
        }

        const data = await response.json();

        if (data.status === 'success') {
          showToast(currentEditingAddressId ? "Address updated successfully!" : "Address saved successfully!");
          closeAddressModal();
          loadAddressBook();
        } else {
          showToast(data.message || "Failed to commit address changes.");
        }
      } catch (err) {
        console.error(err);
        showToast("Network error saving address.");
      }
    });
  }

  // Load addresses from DB
  async function loadAddressBook() {
    const listContainer = document.getElementById('addresses-list');
    if (!listContainer) return;

    listContainer.innerHTML = `
      <div class="loading-state">
        <span class="loading-spinner">⏳</span>
        <p>Loading your saved addresses...</p>
      </div>
    `;

    try {
      const response = await fetch(`${API_URL}/addresses`, { headers: getAuthHeaders() });
      const data = await response.json();

      if (data.status !== 'success' || !data.addresses || data.addresses.length === 0) {
        listContainer.innerHTML = `
          <div class="empty-addresses-state">
            <span class="empty-icon">🏠</span>
            <p>No saved addresses in your book.</p>
            <p class="sub-text">Add your billing/shipping addresses now to fast-track checkouts.</p>
          </div>
        `;
        dismissPreloader();
        return;
      }

      listContainer.innerHTML = ''; // Clear spinner

      data.addresses.forEach(addr => {
        const card = document.createElement('div');
        card.className = `address-card glass-card ${addr.is_default ? 'default-address' : ''}`;
        
        const typeBadge = addr.address_type.toUpperCase() === 'shipping' 
          ? '<span class="addr-badge shipping-badge">📦 Shipping</span>'
          : '<span class="addr-badge billing-badge">💳 Billing</span>';
        
        const defaultBadge = addr.is_default 
          ? '<span class="addr-badge default-badge">Primary</span>'
          : '';

        card.innerHTML = `
          <div class="addr-header-row">
            ${typeBadge}
            ${defaultBadge}
          </div>
          <div class="addr-card-content">
            <p class="addr-street-line">${addr.street}</p>
            <p class="addr-city-zip">${addr.city}, ${addr.state} ${addr.postal_code}</p>
            <p class="addr-country-line">${addr.country}</p>
          </div>
          <div class="addr-card-actions">
            <button class="btn btn-secondary btn-xs edit-addr-btn" data-id="${addr.id}">Edit</button>
            <button class="btn btn-outline-danger btn-xs delete-addr-btn" data-id="${addr.id}">Delete</button>
          </div>
        `;
        
        listContainer.appendChild(card);
      });

      // Bind dynamic actions
      listContainer.querySelectorAll('.edit-addr-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const address = data.addresses.find(a => a.id === id);
          if (address) {
            currentEditingAddressId = id;
            document.getElementById('addr-street').value = address.street;
            document.getElementById('addr-city').value = address.city;
            document.getElementById('addr-state').value = address.state;
            document.getElementById('addr-zip').value = address.postal_code;
            document.getElementById('addr-country').value = address.country;
            document.getElementById('addr-type').value = address.address_type;
            document.getElementById('addr-default').checked = address.is_default;

            if (addressModalTitle) addressModalTitle.innerText = "Edit Address";
            if (addressFormModal) addressFormModal.classList.remove('hide');
          }
        });
      });

      listContainer.querySelectorAll('.delete-addr-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          if (confirm("Are you sure you want to delete this address?")) {
            try {
              const res = await fetch(`${API_URL}/addresses/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
              });
              const result = await res.json();
              if (result.status === 'success') {
                showToast("Address deleted successfully.");
                loadAddressBook();
              } else {
                showToast(result.message || "Failed to delete address.");
              }
            } catch (err) {
              console.error(err);
              showToast("Network error deleting address.");
            }
          }
        });
      });

      dismissPreloader();
    } catch (err) {
      console.error(err);
      listContainer.innerHTML = `
        <div class="error-state">
          <p>⚠️ Failed to load address book database logs. Please retry.</p>
        </div>
      `;
      dismissPreloader();
    }
  }

  // ==========================================================================
  // TAB C: My Custom Blends saved recipe library list loader
  // ==========================================================================
  async function loadCustomBlends() {
    const listContainer = document.getElementById('blends-list');
    if (!listContainer) return;

    listContainer.innerHTML = `
      <div class="loading-state">
        <span class="loading-spinner">⏳</span>
        <p>Loading your saved recipes...</p>
      </div>
    `;

    try {
      const response = await fetch(`${API_URL}/custom-juices`, { headers: getAuthHeaders() });
      const data = await response.json();

      if (data.status !== 'success' || !data.juices || data.juices.length === 0) {
        listContainer.innerHTML = `
          <div class="empty-blends-state">
            <span class="empty-icon">🧪</span>
            <h4>No Custom Recipes Stashed</h4>
            <p>Go to the interactive builder lab, select your ingredients, and save your perfect formula!</p>
            <a href="builder.html" class="btn btn-primary btn-sm">Enter Builder Lab</a>
          </div>
        `;
        dismissPreloader();
        return;
      }

      listContainer.innerHTML = ''; // Clear spinner

      data.juices.forEach(juice => {
        const parsedIngredients = typeof juice.ingredients === 'string' 
          ? JSON.parse(juice.ingredients) 
          : juice.ingredients;

        // Render ingredients percentages
        let ingredientsListHtml = '';
        const ingredientDataMap = {
          mango: { name: "Alphonso Mango", emoji: "🥭" },
          orange: { name: "Nagpur Orange", emoji: "🍊" },
          cherry: { name: "Wild Cherries", emoji: "🍒" },
          blueberry: { name: "Wild Blueberry", emoji: "🫐" },
          mint: { name: "Fresh Mint", emoji: "🍃" },
          ginger: { name: "Golden Ginger", emoji: "🫚" },
          spinach: { name: "Baby Spinach", emoji: "🥬" },
          chia: { name: "Chia Seeds", emoji: "🌾" }
        };

        Object.keys(parsedIngredients).forEach(key => {
          const value = parsedIngredients[key];
          const match = ingredientDataMap[key] || { name: key, emoji: "🌿" };
          ingredientsListHtml += `
            <div class="blend-ingredient-item">
              <span class="blend-ingredient-name">${match.emoji} ${match.name}</span>
              <span class="blend-ingredient-value">${value}%</span>
            </div>
          `;
        });

        // Set visual bottle fill color
        const liquidBg = juice.color_rgb || "rgb(245, 158, 11)";

        const card = document.createElement('div');
        card.className = 'blend-card-wrapper glass-card';
        card.innerHTML = `
          <div class="blend-bottle-visualization">
            <div class="blend-cap-render"></div>
            <div class="blend-neck-render"></div>
            <div class="blend-bottle-body">
              <div class="blend-liquid-fill" style="background: ${liquidBg}; height: 85%;"></div>
              <div class="blend-bottle-label">
                <span class="label-logo">🌿</span>
                <span class="label-title">NatureSip</span>
              </div>
            </div>
          </div>
          <div class="blend-card-details">
            <h4 class="blend-name-title">${juice.blend_name}</h4>
            <div class="blend-ingredients-box">
              ${ingredientsListHtml}
            </div>
            <button class="btn btn-primary btn-block btn-sm blend-purchase-cta" data-id="${juice.id}" data-name="${juice.blend_name}" data-color="${liquidBg}">
              🛒 Add 6-Pack to Cart
            </button>
          </div>
        `;

        listContainer.appendChild(card);
      });

      // Bind Purchase CTAs
      listContainer.querySelectorAll('.blend-purchase-cta').forEach(btn => {
        btn.addEventListener('click', async () => {
          const juiceId = btn.getAttribute('data-id');
          const blendName = btn.getAttribute('data-name');
          const color = btn.getAttribute('data-color');
          
          btn.disabled = true;
          btn.innerText = "Adding to Cart...";

          try {
            // Check if cart exists / add to cart endpoint
            const res = await fetch(`${API_URL}/cart/items`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({
                custom_juice_id: juiceId,
                quantity: 1
              })
            });

            const result = await res.json();
            if (result.status === 'success') {
              showToast(`"${blendName}" 6-pack added to shopping cart! 🛒`);
              // Trigger header cart count updates
              if (window.refreshCartState) {
                window.refreshCartState();
              } else {
                // Trigger reload to force update navbar badge
                setTimeout(() => window.location.reload(), 800);
              }
            } else {
              showToast(result.message || "Failed to add blend to cart.");
            }
          } catch (err) {
            console.error(err);
            showToast("Network error adding blend to cart.");
          } finally {
            btn.disabled = false;
            btn.innerText = "🛒 Add 6-Pack to Cart";
          }
        });
      });

      dismissPreloader();
    } catch (err) {
      console.error(err);
      listContainer.innerHTML = `
        <div class="error-state">
          <p>⚠️ Failed to fetch saved recipes from profile. Please retry.</p>
        </div>
      `;
      dismissPreloader();
    }
  }

  // ==========================================================================
  // TAB D: Wellness Quiz profile recommendation history list loader
  // ==========================================================================
  async function loadWellnessProfile() {
    const container = document.getElementById('wellness-profile-content');
    if (!container) return;

    container.innerHTML = `
      <div class="loading-state">
        <span class="loading-spinner">⏳</span>
        <p>Loading wellness stats...</p>
      </div>
    `;

    try {
      const response = await fetch(`${API_URL}/quiz/results`, { headers: getAuthHeaders() });
      const data = await response.json();

      if (data.status !== 'success' || !data.results || data.results.length === 0) {
        container.innerHTML = `
          <div class="empty-wellness-state">
            <span class="empty-icon">🥗</span>
            <h4>No Wellness Results Logged</h4>
            <p>Take our targeted lifestyle and flavor affinity quiz to generate personalized nutrition logs!</p>
            <a href="quiz.html" class="btn btn-primary btn-sm">Take Wellness Quiz</a>
          </div>
        `;
        dismissPreloader();
        return;
      }

      container.innerHTML = ''; // Clear spinner

      // Display the most recent quiz recommendation on top prominently, then list previous ones
      const latestResult = data.results[0];
      const parsedAnswers = typeof latestResult.quiz_answers === 'string'
        ? JSON.parse(latestResult.quiz_answers)
        : latestResult.quiz_answers;

      const dateStr = new Date(latestResult.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      // Flavor meta mapping
      const recommendationMeta = {
        'Alphonso Mango Royale': {
          emoji: '🥭',
          desc: 'High in Vitamin A and antioxidant enzymes. Designed to boost immune functions, improve skin elasticity, and support digestive balances.',
          stats: { energy: '90%', immunity: '95%', hydration: '85%' }
        },
        'Nagpur Orange Burst': {
          emoji: '🍊',
          desc: 'Rich in Vitamin C and electrolytes. Formulated for cardiovascular wellness, cellular replenishment, and post-workout revitalization.',
          stats: { energy: '85%', immunity: '98%', hydration: '90%' }
        },
        'Mixed Fruit Supreme': {
          emoji: '🍇',
          desc: 'A comprehensive multi-fruit blend providing broad spectrum phytonutrients. Ideal for daily metabolic support, energy level maintenance, and body alkalinity.',
          stats: { energy: '92%', immunity: '90%', hydration: '92%' }
        },
        'Pomegranate Power': {
          emoji: '🍒',
          desc: 'Highly concentrated in anthocyanins and polyphenols. Fights free-radical cell damage, improves muscular recovery, and promotes circulatory performance.',
          stats: { energy: '80%', immunity: '95%', hydration: '80%' }
        },
        'Watermelon Chill': {
          emoji: '🍉',
          desc: 'Contains high amounts of L-Citrulline and hydration components. Supports blood flow regulation, joint health, and immediate cellular rehydration.',
          stats: { energy: '75%', immunity: '85%', hydration: '98%' }
        },
        'Blueberry Matcha Spark': {
          emoji: '🍵',
          desc: 'Infused with premium stone-ground matcha green tea and wild blueberries. Rich in L-Theanine and cognitive catechins for sustained focus without caffeine crashes.',
          stats: { energy: '95%', immunity: '92%', hydration: '85%' }
        }
      };

      const meta = recommendationMeta[latestResult.primary_recommendation] || {
        emoji: '🌿',
        desc: 'A balanced nature-derived blend containing minerals and enzymes tailored to your physical attributes.',
        stats: { energy: '85%', immunity: '85%', hydration: '85%' }
      };

      // Populate answers summary list
      let answersHtml = '';
      const questionLabels = {
        goal: '🎯 Primary Wellness Goal',
        taste: '👅 Favorite Taste Profile',
        activity: '🏃‍♂️ Daily Activity Level',
        hydration: '💧 Average Water Intake'
      };

      Object.keys(parsedAnswers).forEach(key => {
        const questionText = questionLabels[key] || key;
        const answerText = parsedAnswers[key];
        answersHtml += `
          <div class="quiz-answer-row">
            <span class="q-label">${questionText}</span>
            <span class="a-value">${answerText.charAt(0).toUpperCase() + answerText.slice(1)}</span>
          </div>
        `;
      });

      const featuredSection = document.createElement('div');
      featuredSection.className = 'wellness-featured-card glass-card';
      featuredSection.innerHTML = `
        <div class="featured-badge">🏆 CURRENT MATCH</div>
        <div class="featured-flex-row">
          <div class="featured-emoji-box">${meta.emoji}</div>
          <div class="featured-details-box">
            <span class="profile-date-tag">Matched on: ${dateStr}</span>
            <h3 class="featured-recommendation-title">${latestResult.primary_recommendation}</h3>
            <p class="featured-desc">${meta.desc}</p>
            
            <div class="featured-nutri-stats">
              <div class="stat-progress-group">
                <span class="stat-name">Immunity Booster</span>
                <div class="stat-bar-track"><div class="stat-bar-fill" style="width: ${meta.stats.immunity}"></div></div>
                <span class="stat-val-text">${meta.stats.immunity}</span>
              </div>
              <div class="stat-progress-group">
                <span class="stat-name">Energy Release</span>
                <div class="stat-bar-track"><div class="stat-bar-fill" style="width: ${meta.stats.energy}"></div></div>
                <span class="stat-val-text">${meta.stats.energy}</span>
              </div>
              <div class="stat-progress-group">
                <span class="stat-name">Cellular Hydration</span>
                <div class="stat-bar-track"><div class="stat-bar-fill" style="width: ${meta.stats.hydration}"></div></div>
                <span class="stat-val-text">${meta.stats.hydration}</span>
              </div>
            </div>
          </div>
        </div>
        
        <hr class="card-section-divider">
        
        <div class="wellness-answers-section">
          <h5>Your Wellness Quiz Inputs</h5>
          <div class="quiz-answers-grid">
            ${answersHtml}
          </div>
        </div>
      `;

      container.appendChild(featuredSection);

      // Render previous matching history list if count > 1
      if (data.results.length > 1) {
        const historyWrapper = document.createElement('div');
        historyWrapper.className = 'wellness-history-wrapper';
        historyWrapper.innerHTML = '<h4>Quiz Matching History</h4>';

        const historyList = document.createElement('div');
        historyList.className = 'wellness-history-list';

        data.results.slice(1).forEach(res => {
          const prevDate = new Date(res.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
          });
          const prevMeta = recommendationMeta[res.primary_recommendation] || { emoji: '🌿' };

          const historyItem = document.createElement('div');
          historyItem.className = 'wellness-history-item glass-card';
          historyItem.innerHTML = `
            <span class="history-emoji">${prevMeta.emoji}</span>
            <div class="history-info-box">
              <span class="history-date">${prevDate}</span>
              <span class="history-title">${res.primary_recommendation}</span>
            </div>
            <a href="index.html#flavors" class="btn btn-secondary btn-xs">View Details</a>
          `;
          historyList.appendChild(historyItem);
        });

        historyWrapper.appendChild(historyList);
        container.appendChild(historyWrapper);
      }

      dismissPreloader();
    } catch (err) {
      console.error(err);
      container.innerHTML = `
        <div class="error-state">
          <p>⚠️ Failed to fetch quiz records. Please reload.</p>
        </div>
      `;
      dismissPreloader();
    }
  }
});
