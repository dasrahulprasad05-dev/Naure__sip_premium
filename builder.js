/* ==========================================================================
   NatureSip Custom Builder Controller
   ========================================================================== */
import { initAuth } from './auth.js';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://naure-sip-premium.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Authentication State
  initAuth();

  // 1. Preloader Screen Simulation
  const preloader = document.getElementById('preloader');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  
  let preloaderProgress = 0;
  const fillPreloader = setInterval(() => {
    preloaderProgress += 5;
    if (progressBar) progressBar.style.width = `${preloaderProgress}%`;
    if (progressText) progressText.innerText = `${preloaderProgress}%`;
    
    if (preloaderProgress >= 100) {
      clearInterval(fillPreloader);
      setTimeout(() => {
        if (preloader) preloader.classList.add('fade-out');
      }, 300);
    }
  }, 20);

  // 2. Ingredients Properties & Formulas
  const ingredientData = {
    mango: {
      emoji: "🥭",
      name: "Alphonso Mango",
      rgb: [245, 158, 11], // mango amber
      values: { sweet: 35, tangy: 10, earthy: 5, refresh: 15, calories: 52, vitc: 35, antiox: 20, hydrate: 15 }
    },
    orange: {
      emoji: "🍊",
      name: "Nagpur Orange",
      rgb: [234, 88, 12], // orange zesty
      values: { sweet: 20, tangy: 35, earthy: 0, refresh: 25, calories: 48, vitc: 50, antiox: 15, hydrate: 20 }
    },
    cherry: {
      emoji: "🍒",
      name: "Wild Cherries",
      rgb: [225, 29, 72], // cherry red
      values: { sweet: 25, tangy: 15, earthy: 5, refresh: 15, calories: 45, vitc: 20, antiox: 45, hydrate: 10 }
    },
    blueberry: {
      emoji: "🫐",
      name: "Blueberry Pack",
      rgb: [29, 78, 216], // deep blue
      values: { sweet: 20, tangy: 10, earthy: 10, refresh: 20, calories: 38, vitc: 15, antiox: 50, hydrate: 12 }
    },
    mint: {
      emoji: "🍃",
      name: "Organic Mint",
      rgb: [16, 185, 129], // mint green
      values: { sweet: 5, tangy: 5, earthy: 15, refresh: 45, calories: 5, vitc: 10, antiox: 25, hydrate: 30 }
    },
    ginger: {
      emoji: "🫚",
      name: "Fresh Ginger",
      rgb: [217, 119, 6], // gold ginger
      values: { sweet: 5, tangy: 25, earthy: 30, refresh: 15, calories: 10, vitc: 15, antiox: 30, hydrate: 8 }
    },
    spinach: {
      emoji: "🥬",
      name: "Baby Spinach",
      rgb: [4, 120, 87], // emerald green
      values: { sweet: 0, tangy: 5, earthy: 40, refresh: 10, calories: 8, vitc: 25, antiox: 30, hydrate: 35 }
    },
    chia: {
      emoji: "🌾",
      name: "Chia Seeds",
      rgb: [100, 116, 139], // slate chia
      values: { sweet: 5, tangy: 0, earthy: 30, refresh: 5, calories: 32, vitc: 5, antiox: 20, hydrate: 10 }
    }
  };

  // 3. Builder State Variables
  let activeBlend = []; // list of keys
  let isBlended = false;
  let activeCapColor = 'slate';

  // 4. DOM Elements
  const dropzone = document.getElementById('blender-dropzone');
  const dropHintText = document.getElementById('drop-hint-text');
  const liquidFill = document.getElementById('blender-liquid-fill');
  const particlesLayer = document.getElementById('blender-particles');
  const capSelector = document.getElementById('blender-bottle-cap');
  
  const capDots = document.querySelectorAll('.cap-dot');
  const pantryItems = document.querySelectorAll('.pantry-item');

  const blendBtn = document.getElementById('blender-blend-btn');
  const clearBtn = document.getElementById('blender-clear-btn');
  const checkoutBtn = document.getElementById('builder-checkout-btn');
  const blendNameInput = document.getElementById('custom-blend-name');

  // Stats Displays
  const fillSweet = document.getElementById('fill-sweet');
  const fillTangy = document.getElementById('fill-tangy');
  const fillEarthy = document.getElementById('fill-earthy');
  const fillRefresh = document.getElementById('fill-refresh');

  const nutriCalories = document.getElementById('nutri-calories');
  const nutriVitC = document.getElementById('nutri-vitc');
  const nutriAntiox = document.getElementById('nutri-antiox');
  const nutriHydrate = document.getElementById('nutri-hydrate');

  // 5. Drag & Drop Event Listeners
  pantryItems.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', item.getAttribute('data-ing'));
    });

    // Mobile/Click fallback
    item.addEventListener('click', () => {
      const ingKey = item.getAttribute('data-ing');
      addIngredient(ingKey);
    });
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    
    const ingKey = e.dataTransfer.getData('text/plain');
    if (ingKey && ingredientData[ingKey]) {
      addIngredient(ingKey);
    }
  });

  // 6. Core Ingredient Addition Logic
  const addIngredient = (ingKey) => {
    if (activeBlend.length >= 5) {
      alert("Blender is full! Maximum 5 ingredients.");
      return;
    }
    
    isBlended = false;
    checkoutBtn.disabled = true;
    blendBtn.disabled = false;

    activeBlend.push(ingKey);
    
    // Hide dropzone label
    if (dropHintText) dropHintText.style.display = 'none';

    // Spawn falling particle emoji animation
    spawnIngredientParticle(ingredientData[ingKey].emoji);

    // Update analytics
    recalculateDashboard();
  };

  const spawnIngredientParticle = (emoji) => {
    const particle = document.createElement('span');
    particle.className = 'blender-particle';
    particle.innerText = emoji;
    
    // Random horizontal position inside dropzone width
    const rect = dropzone.getBoundingClientRect();
    const xPos = Math.random() * (rect.width - 40) + 10;
    
    particle.style.left = `${xPos}px`;
    particle.style.top = `-30px`; // start just above
    
    particlesLayer.appendChild(particle);

    // Fall animation complete -> stays floating at bottom
    setTimeout(() => {
      particle.style.transform = 'translateY(150px) scale(0.95)';
    }, 50);
  };

  // 7. Calculate Liquid mixed colors and nutrition meters
  const recalculateDashboard = () => {
    const count = activeBlend.length;
    if (count === 0) {
      resetDashboardMeters();
      return;
    }

    // A. Calculations
    let sweetTotal = 0, tangyTotal = 0, earthyTotal = 0, refreshTotal = 0;
    let caloriesTotal = 0, vitcTotal = 0, antioxTotal = 0, hydrateTotal = 0;
    let rSum = 0, gSum = 0, bSum = 0;

    activeBlend.forEach(key => {
      const data = ingredientData[key];
      
      sweetTotal += data.values.sweet;
      tangyTotal += data.values.tangy;
      earthyTotal += data.values.earthy;
      refreshTotal += data.values.refresh;

      caloriesTotal += data.values.calories;
      vitcTotal += data.values.vitc;
      antioxTotal += data.values.antiox;
      hydrateTotal += data.values.hydrate;

      rSum += data.rgb[0];
      gSum += data.rgb[1];
      bSum += data.rgb[2];
    });

    // Averaged liquid color
    const rAvg = Math.round(rSum / count);
    const gAvg = Math.round(gSum / count);
    const bAvg = Math.round(bSum / count);

    // B. DOM updates
    // Liquid level goes up based on active ingredient volume (max 5)
    const levelPercentage = (count / 5) * 85;
    liquidFill.style.height = `${levelPercentage}%`;
    liquidFill.style.background = `rgba(${rAvg}, ${gAvg}, ${bAvg}, 0.75)`;
    liquidFill.style.boxShadow = `inset 0 10px 20px rgba(${rAvg}, ${gAvg}, ${bAvg}, 0.5), 0 0 15px rgba(${rAvg}, ${gAvg}, ${bAvg}, 0.3)`;

    // Taste Profiles (capped at 100%)
    fillSweet.style.width = `${Math.min(100, sweetTotal)}%`;
    fillTangy.style.width = `${Math.min(100, tangyTotal)}%`;
    fillEarthy.style.width = `${Math.min(100, earthyTotal)}%`;
    fillRefresh.style.width = `${Math.min(100, refreshTotal)}%`;

    // Nutrition values
    nutriCalories.innerText = caloriesTotal;
    nutriVitC.innerText = `${Math.min(100, vitcTotal)}%`;
    nutriAntiox.innerText = `${Math.min(100, antioxTotal)}%`;
    nutriHydrate.innerText = `${Math.min(100, hydrateTotal)}%`;
  };

  const resetDashboardMeters = () => {
    liquidFill.style.height = '0%';
    liquidFill.style.background = 'rgba(255, 255, 255, 0.15)';
    liquidFill.style.boxShadow = 'none';

    fillSweet.style.width = '0%';
    fillTangy.style.width = '0%';
    fillEarthy.style.width = '0%';
    fillRefresh.style.width = '0%';

    nutriCalories.innerText = '0';
    nutriVitC.innerText = '0%';
    nutriAntiox.innerText = '0%';
    nutriHydrate.innerText = '0%';
    
    if (dropHintText) dropHintText.style.display = 'block';
    particlesLayer.innerHTML = '';

    blendBtn.disabled = true;
    checkoutBtn.disabled = true;
  };

  // 8. Blender Blade Spin & Mix Animation
  blendBtn.addEventListener('click', () => {
    if (activeBlend.length === 0) return;
    
    blendBtn.disabled = true;
    clearBtn.disabled = true;

    // Trigger blade rotation and blender container shake styles
    document.querySelector('.blender-blades-hub').classList.add('spinning');
    dropzone.classList.add('shaking');
    liquidFill.classList.add('blending-liquid');

    // Make floating emojis bounce and dissolve
    const particles = document.querySelectorAll('.blender-particle');
    particles.forEach(p => {
      p.classList.add('dissolving');
    });

    setTimeout(() => {
      // Animation complete
      document.querySelector('.blender-blades-hub').classList.remove('spinning');
      dropzone.classList.remove('shaking');
      liquidFill.classList.remove('blending-liquid');

      // Remove particles from DOM completely (they dissolved into liquid)
      particlesLayer.innerHTML = '';
      
      isBlended = true;
      checkoutBtn.disabled = false;
      clearBtn.disabled = false;
    }, 2000);
  });

  // 9. Reset button click
  clearBtn.addEventListener('click', () => {
    activeBlend = [];
    isBlended = false;
    resetDashboardMeters();
  });

  // 10. Cap Style Selector
  capDots.forEach(dot => {
    dot.addEventListener('click', () => {
      capDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');

      activeCapColor = dot.getAttribute('data-color');
      
      // Update blender cap CSS style class
      capSelector.className = `blender-cap cap-color-${activeCapColor}`;
    });
  });

  // 11. Lock Recipe & pre-fill checkout preorder details
  checkoutBtn.addEventListener('click', () => {
    if (!isBlended || activeBlend.length === 0) return;

    let blendName = blendNameInput.value.trim();
    if (blendName === '') {
      blendName = "My NatureSip Custom Blend";
    }

    const customFormula = {
      name: blendName,
      ingredients: activeBlend.map(k => ingredientData[k].emoji),
      capColor: activeCapColor
    };

    // Stash formula detail locally
    localStorage.setItem('custom-blend', JSON.stringify(customFormula));
    localStorage.setItem('preorder-flavor', 'custom');

    const token = localStorage.getItem('token');
    if (token) {
      // Authenticated user: save custom recipe to database
      checkoutBtn.disabled = true;
      const originalText = checkoutBtn.innerText;
      checkoutBtn.innerText = "Saving Blend...";

      fetch(`${API_URL}/custom-juices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          blend_name: blendName,
          ingredients: activeBlend.reduce((acc, k) => {
            acc[k] = (acc[k] || 0) + 20; // 20% per ingredient drop
            return acc;
          }, {}),
          color_rgb: liquidFill.style.background || "rgb(15, 23, 42)"
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          localStorage.setItem('custom-juice-id', data.custom_juice_id);
          window.location.href = 'index.html#preorder';
        } else {
          alert("Could not save your custom blend to your database profile, but you can still preorder.");
          window.location.href = 'index.html#preorder';
        }
      })
      .catch(err => {
        console.error(err);
        // Fallback gracefully to local guest preorder flow
        window.location.href = 'index.html#preorder';
      });
    } else {
      // Guest flow
      window.location.href = 'index.html#preorder';
    }
  });

  // 12. Dark Mode Switch logic
  const themeToggleBtns = document.querySelectorAll('#theme-toggle-btn, #mobile-theme-toggle-btn');
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    document.body.classList.add('dark-mode');
  }
  
  themeToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDarkMode = document.body.classList.toggle('dark-mode');
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });
  });

  // 13. Mobile Nav Menu Toggle
  const mobileToggle = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const isActive = mobileToggle.classList.toggle('active');
      mobileMenu.classList.toggle('active', isActive);
    });
  }
  
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
    });
  });

});
