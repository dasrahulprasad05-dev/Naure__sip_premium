/* ==========================================================================
   NatureSip Premium JavaScript Controller
   ========================================================================== */
import { initAuth } from './auth.js';

const API_URL = 'https://naure-sip-premium.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Authentication State
  initAuth();
  
  // 1. Core Config & Asset Preloading Setup
  const frameCount = 240;
  const images = [];
  let loadedCount = 0;
  
  const preloader = document.getElementById('preloader');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  
  const canvas = document.getElementById('animation-canvas');
  const ctx = canvas.getContext('2d');
  const storySection = document.getElementById('hero');

  // Generate Image Path Array
  const getFramePath = (index) => {
    // Frames are 1-indexed (001 to 240)
    const frameNum = String(index).padStart(3, '0');
    return `./frames/ezgif-frame-${frameNum}.jpg`;
  };

  // Preload Images
  const preloadImages = () => {
    return new Promise((resolve) => {
      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = getFramePath(i);
        img.onload = () => {
          loadedCount++;
          const percent = Math.round((loadedCount / frameCount) * 100);
          progressBar.style.width = `${percent}%`;
          progressText.innerText = `${percent}%`;
          
          if (loadedCount === frameCount) {
            setTimeout(() => {
              preloader.classList.add('fade-out');
              resolve();
            }, 600); // Slight delay for visual satisfaction
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === frameCount) {
            preloader.classList.add('fade-out');
            resolve();
          }
        };
        images.push(img);
      }
    });
  };

  // 2. High-DPI Canvas Handling & Contain Ratio Draw
  let cssWidth = 0;
  let cssHeight = 0;

  const resizeCanvas = () => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    cssWidth = rect.width;
    cssHeight = rect.height;
    
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    
    ctx.scale(dpr, dpr);
    
    // Redraw the current frame after resizing
    drawFrame(Math.round(currentFrame));
  };

  const drawFrame = (index) => {
    if (!images[index]) return;
    
    const img = images[index];
    
    // Clear Canvas
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    
    // Calculate aspect ratio (Contain effect - NO CROPPING)
    const imgRatio = img.width / img.height;
    const canvasRatio = cssWidth / cssHeight;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (imgRatio > canvasRatio) {
      // Image is wider than canvas - fit to width
      drawWidth = cssWidth;
      drawHeight = cssWidth / imgRatio;
      offsetX = 0;
      offsetY = (cssHeight - drawHeight) / 2;
    } else {
      // Image is taller than canvas - fit to height
      drawHeight = cssHeight;
      drawWidth = cssHeight * imgRatio;
      offsetX = (cssWidth - drawWidth) / 2;
      offsetY = 0;
    }
    
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // 3. Scroll Tracking & Smooth Interpolation (Lerp)
  let currentFrame = 0;
  let targetFrame = 0;
  let lastDrawnFrame = -1;
  const lerpFactor = 0.08; // Control smooth velocity

  const updateScrollProgress = () => {
    const rect = storySection.getBoundingClientRect();
    const sectionHeight = rect.height;
    const viewportHeight = window.innerHeight;
    
    // Scrollable height of this sticky block is height minus sticky viewport
    const totalScrollable = sectionHeight - viewportHeight;
    const scrolled = -rect.top;
    
    // Normalize progress [0, 1]
    let progress = scrolled / totalScrollable;
    progress = Math.max(0, Math.min(1, progress));
    
    // Map to frame indices
    targetFrame = progress * (frameCount - 1);

    // Hide scroll indicator mouse once user scrolls past top screen
    const scrollIndicator = document.getElementById('scroll-indicator');
    if (window.scrollY > 100) {
      scrollIndicator.style.opacity = '0';
      scrollIndicator.style.pointerEvents = 'none';
    } else {
      scrollIndicator.style.opacity = '0.8';
      scrollIndicator.style.pointerEvents = 'auto';
    }
  };

  // Lerping Draw Loop
  const animationLoop = () => {
    const diff = targetFrame - currentFrame;
    
    if (Math.abs(diff) > 0.01) {
      currentFrame += diff * lerpFactor;
    } else {
      currentFrame = targetFrame;
    }
    
    const roundedFrameIndex = Math.round(currentFrame);
    
    // Draw only if index changes to conserve processing cycles
    if (roundedFrameIndex !== lastDrawnFrame) {
      drawFrame(roundedFrameIndex);
      lastDrawnFrame = roundedFrameIndex;
    }
    
    requestAnimationFrame(animationLoop);
  };

  // Initialize Canvas Scroll Components after loading completes
  preloadImages().then(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', updateScrollProgress);
    
    // Start drawing loop
    animationLoop();
  });

  // 4. Header Dynamic Class Toggle
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 5. Mobile Toggle Navigation Handler
  const mobileToggle = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  const toggleMenuState = () => {
    const isActive = mobileToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active', isActive);
  };

  mobileToggle.addEventListener('click', toggleMenuState);
  
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
    });
  });

  // 6. Benefits Accordion & Interactive Fruit Nodes
  const accordionItems = document.querySelectorAll('.accordion-item');
  const fruitNodes = document.querySelectorAll('.interactive-fruit-node');
  
  // Mapping of targets to data definitions
  const benefitsData = {
    'benefit-antioxidants': {
      title: 'Antioxidant Boost',
      text: 'Cherries combat free radicals and ease muscular soreness naturally.'
    },
    'benefit-immunity': {
      title: 'Immune System Shield',
      text: 'A single bottle delivers 100% Vitamin C from organic mango nectar.'
    },
    'benefit-hydration': {
      title: 'Clean Hydration',
      text: 'Pure spring water infused with organic electrolytes keeps you alert.'
    },
    'benefit-vitc': {
      title: 'Vitamin C Shield',
      text: 'Nagpur orange juices provide pure ascorbic acid to support vitality.'
    },
    'benefit-heart': {
      title: 'Polyphenol Power',
      text: 'Pomegranate cold-press supports healthy circulation and heart health.'
    },
    'benefit-watermelon': {
      title: 'Natural Recovery',
      text: 'Watermelon with mint contains L-Citrulline for rapid hydration.'
    }
  };

  const updateBenefitsVisual = (targetId) => {
    // Select correct accordion item
    accordionItems.forEach(item => {
      if (item.id === targetId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Select correct fruit node
    fruitNodes.forEach(node => {
      if (node.getAttribute('data-target') === targetId) {
        node.classList.add('active');
      } else {
        node.classList.remove('active');
      }
    });

    // Update center description card
    const titleEl = document.getElementById('focused-benefit-title');
    const textEl = document.getElementById('focused-benefit-text');
    if (benefitsData[targetId]) {
      titleEl.innerText = benefitsData[targetId].title;
      textEl.innerText = benefitsData[targetId].text;
    }
  };

  // Accordion Header Clicks
  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    header.addEventListener('click', () => {
      updateBenefitsVisual(item.id);
    });
  });

  // Visual Nodes Clicks
  fruitNodes.forEach(node => {
    node.addEventListener('click', () => {
      const targetId = node.getAttribute('data-target');
      updateBenefitsVisual(targetId);
    });
  });

  // 7. Signup Form Validation & Submission Logic
  const preorderForm = document.getElementById('preorder-form');
  const formSuccess = document.getElementById('form-success');
  const successEmailText = document.getElementById('success-email');
  const successResetBtn = document.getElementById('success-reset-btn');
  
  const nameInput = document.getElementById('user-name');
  const emailInput = document.getElementById('user-email');

  // URL Checkout Callback check
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  const orderId = urlParams.get('order_id');
  const isMockPaymentRedirect = urlParams.get('mock') === 'true';

  if (sessionId && orderId) {
    if (preorderForm && formSuccess) {
      preorderForm.style.display = 'none';
      formSuccess.classList.remove('hide');
      
      const successTitle = formSuccess.querySelector('h3');
      const successDesc = formSuccess.querySelector('p');
      const successIcon = formSuccess.querySelector('.success-icon');
      
      successTitle.innerText = "Securing VIP Pre-order...";
      successDesc.innerText = "Please wait while we verify your checkout transaction and reserve your cold-pressed batch.";
      successIcon.innerText = "⏳";
      
      const emailParam = urlParams.get('email') || '';
      const skuParam = urlParams.get('sku') || '';
      const nameParam = urlParams.get('name') || '';
      const amountParam = urlParams.get('amount') || '';

      const finishConfirmation = (emailAddress) => {
        successTitle.innerText = "VIP Pre-order Confirmed! 🎉";
        successDesc.innerHTML = `Thank you! Your payment has been secured. We've reserved your premium cold-pressed package. Confirmation details sent to <strong>${emailAddress || emailParam || 'your email'}</strong>.`;
        successIcon.innerText = "🎉";
        
        // Clean URL parameters without reloading
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
      };

      if (isMockPaymentRedirect) {
        // Simulated Mock payment confirmation
        fetch(`${API_URL}/payments/confirm-mock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: orderId,
            session_id: sessionId,
            sku: skuParam,
            email: emailParam,
            name: nameParam,
            amount: amountParam
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            finishConfirmation(emailParam);
          } else {
            successTitle.innerText = "Verification Failed ❌";
            successDesc.innerText = data.message || "We encountered an issue verifying your mock checkout transaction.";
            successIcon.innerText = "❌";
          }
        })
        .catch(err => {
          console.error(err);
          successTitle.innerText = "Verification Error ❌";
          successDesc.innerText = "Failed to communicate with payment servers.";
          successIcon.innerText = "❌";
        });
      } else {
        // Real Stripe checkout session verification
        fetch(`${API_URL}/payments/verify-session?session_id=${sessionId}&order_id=${orderId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            finishConfirmation(data.order?.email);
          } else {
            successTitle.innerText = "Verification Failed ❌";
            successDesc.innerText = data.message || "We encountered an issue verifying your checkout session.";
            successIcon.innerText = "❌";
          }
        })
        .catch(err => {
          console.error(err);
          successTitle.innerText = "Verification Error ❌";
          successDesc.innerText = "Failed to connect to verification servers.";
          successIcon.innerText = "❌";
        });
      }
      
      // Auto-scroll to the preorder form status area
      setTimeout(() => {
        const preorderSection = document.getElementById('preorder');
        if (preorderSection) preorderSection.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }

  // Check for custom blend recipe details
  const customDataString = localStorage.getItem('custom-blend');
  if (customDataString) {
    try {
      const customData = JSON.parse(customDataString);
      const customOption = document.getElementById('custom-option');
      if (customOption && customData) {
        customOption.innerText = `Custom Blend: ${customData.name} (${customData.ingredients.join(' ')}) 🧪`;
        customOption.classList.remove('hide');
      }
    } catch (err) {
      console.error('Failed to parse custom-blend', err);
    }
  }

  // Check if we came from the Quiz page or custom builder with a recommended flavor
  const savedPreorderFlavor = localStorage.getItem('preorder-flavor');
  if (savedPreorderFlavor) {
    localStorage.removeItem('preorder-flavor'); // consume key
    
    // Wait for preloader to fade and page layouts to settle
    setTimeout(() => {
      const preorderSection = document.getElementById('preorder');
      if (preorderSection) {
        preorderSection.scrollIntoView({ behavior: 'smooth' });
      }
      
      const flavorSelect = document.getElementById('flavor-preference');
      if (flavorSelect) {
        flavorSelect.value = savedPreorderFlavor;
      }
    }, 1200);
  }

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  nameInput.addEventListener('input', () => {
    if (nameInput.value.trim() !== '') {
      nameInput.classList.remove('invalid');
    }
  });

  emailInput.addEventListener('input', () => {
    if (validateEmail(emailInput.value.trim())) {
      emailInput.classList.remove('invalid');
    }
  });

  preorderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();

    if (nameVal === '') {
      nameInput.classList.add('invalid');
      isValid = false;
    } else {
      nameInput.classList.remove('invalid');
    }

    if (!validateEmail(emailVal)) {
      emailInput.classList.add('invalid');
      isValid = false;
    } else {
      emailInput.classList.remove('invalid');
    }

    if (isValid) {
      const flavorVal = document.getElementById('flavor-preference').value;
      const customJuiceId = localStorage.getItem('custom-juice-id');
      const submitBtn = document.getElementById('submit-preorder-btn');
      const oldBtnText = submitBtn.innerText;
      
      submitBtn.disabled = true;
      submitBtn.innerText = "Processing...";

      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: nameVal,
          email: emailVal,
          flavor_preference: flavorVal,
          custom_juice_id: flavorVal === 'custom' ? customJuiceId : null
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          // Clear custom-blend details from localStorage
          localStorage.removeItem('custom-blend');
          localStorage.removeItem('custom-juice-id');
          
          if (data.checkout_url) {
            // Redirect to Stripe or Mock checkout page
            window.location.href = data.checkout_url;
          } else {
            // Fallback: Show Success Panel directly
            preorderForm.classList.add('hide');
            setTimeout(() => {
              preorderForm.style.display = 'none';
              successEmailText.innerText = emailVal;
              formSuccess.classList.remove('hide');
            }, 300);
          }
        } else {
          alert(data.message || "Something went wrong. Please check your fields.");
        }
      })
      .catch(err => {
        console.error(err);
        alert("Failed to submit preorder. Check your network server connection.");
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerText = oldBtnText;
      });
    }
  });

  successResetBtn.addEventListener('click', () => {
    formSuccess.classList.add('hide');
    setTimeout(() => {
      preorderForm.style.display = 'flex';
      preorderForm.classList.remove('hide');
      preorderForm.reset();
      nameInput.classList.remove('invalid');
      emailInput.classList.remove('invalid');
    }, 300);
  });

  // 8. Flavor Detail Modal & Floating Particles
  const flavorData = {
    mango: {
      title: "Alphonso Mango Royale",
      badge: "Best Seller 🏆",
      themeClass: "mango-theme",
      desc: "Premium mango juice crafted from sun-drenched Alphonso mangoes, offering a velvety texture and pure organic bliss. Rich in natural nutrients, it provides a luxurious tropical escape with every sip.",
      price: "$24.99",
      calories: "52 Kcal",
      rating: "4.9 ★ (3,120 reviews)",
      glowBg: "#f59e0b",
      image: "/images/mango_bottle.png",
      benefits: [
        "100% Organic Alphonso Mangoes",
        "High in Vitamins A & C for glowing skin",
        "No added sugars or preservatives",
        "Supports natural digestive health"
      ],
      taste: [
        { label: "Sweetness", value: "90%" },
        { label: "Tanginess", value: "30%" },
        { label: "Energy", value: "85%" }
      ],
      emojis: ['🥭', '🍃', '✨', '🥭']
    },
    orange: {
      title: "Nagpur Orange Burst",
      badge: "Signature Blend 🍊",
      themeClass: "orange-theme",
      desc: "Refreshing, zesty orange juice inspired by hand-picked premium Nagpur oranges for a tangy immune boost. Packed with crisp, fresh pulpy goodness that revitalizes your body and awakens your senses.",
      price: "$22.99",
      calories: "48 Kcal",
      rating: "4.8 ★ (1,840 reviews)",
      glowBg: "#ea580c",
      image: "/images/orange_bottle.png",
      benefits: [
        "100% Nagpur Orange Squeezes",
        "Excellent source of Vitamin C (Daily Value)",
        "Aids immune shield development",
        "Rich in natural flavonoids"
      ],
      taste: [
        { label: "Sweetness", value: "70%" },
        { label: "Tanginess", value: "80%" },
        { label: "Energy", value: "75%" }
      ],
      emojis: ['🍊', '🍃', '✨', '🍊']
    },
    mixed: {
      title: "Mixed Fruit Supreme",
      badge: "Most Popular 🔥",
      themeClass: "mixed-theme",
      desc: "A premium, harmonious medley of Alphonso mango, Nagpur orange, crisp apples, and fresh forest berries. A complex flavor profile that delivers the ultimate nutrient spectrum for all-day vitality.",
      price: "$25.99",
      calories: "45 Kcal",
      rating: "4.9 ★ (4,250 reviews)",
      glowBg: "linear-gradient(to bottom, #d97706, #db2777)",
      image: "/images/mixed_fruit_bottle.png",
      benefits: [
        "Medley of Mango, Orange, Apple, and Berries",
        "Packed with multi-vitamins and prebiotics",
        "High antioxidant activity from berries",
        "Natural energy booster without crash"
      ],
      taste: [
        { label: "Sweetness", value: "85%" },
        { label: "Tanginess", value: "50%" },
        { label: "Energy", value: "80%" }
      ],
      emojis: ['🥭', '🍊', '🍓', '🍉', '🍃', '✨']
    },
    pomegranate: {
      title: "Pomegranate Power",
      badge: "Antioxidant Rich 🍷",
      themeClass: "pomegranate-theme",
      desc: "A rich ruby nectar packed with vital antioxidants and natural electrolytes to revitalize and recharge your system. Gently cold-pressed to retain its biological active compounds.",
      price: "$26.99",
      calories: "58 Kcal",
      rating: "4.7 ★ (1,560 reviews)",
      glowBg: "#dc2626",
      image: "/images/pomegranate_bottle.png",
      benefits: [
        "Pure Cold-Pressed Pomegranate Seeds",
        "Rich in heart-healthy polyphenols",
        "Natural source of electrolytes for hydration",
        "Combats post-exercise fatigue"
      ],
      taste: [
        { label: "Sweetness", value: "55%" },
        { label: "Tanginess", value: "75%" },
        { label: "Energy", value: "90%" }
      ],
      emojis: ['🍒', '🍷', '🍃', '✨', '🍒']
    },
    watermelon: {
      title: "Watermelon Chill",
      badge: "Summer Special 🍉",
      themeClass: "watermelon-theme",
      desc: "Clean, hydrating watermelon juice infused with a splash of fresh organic mint leaves for ultimate summer recovery. Keeps you refreshed and well-hydrated during warm days or intense workouts.",
      price: "$21.99",
      calories: "38 Kcal",
      rating: "4.8 ★ (2,110 reviews)",
      glowBg: "#f43f5e",
      image: "/images/watermelon_bottle.png",
      benefits: [
        "95% Organic Watermelon Nectar + Mint Slices",
        "Natural L-Citrulline for muscle recovery",
        "Extremely hydrating & low calorie",
        "Ultra-refreshing post-workout drink"
      ],
      taste: [
        { label: "Sweetness", value: "80%" },
        { label: "Tanginess", value: "20%" },
        { label: "Energy", value: "70%" }
      ],
      emojis: ['🍉', '🍃', '✨', '🍉']
    },
    matcha: {
      title: "Blueberry Matcha Spark",
      badge: "Coming Soon ⏳",
      themeClass: "matcha-theme",
      desc: "An upcoming superfood fusion combining sweet antioxidant-rich blueberries, ceremonial Uji Matcha, and a touch of organic lavender. Formulated to provide calm focus and sustained clean energy.",
      price: "$27.99",
      calories: "42 Kcal",
      rating: "5.0 ★ (Upcoming Launch)",
      glowBg: "linear-gradient(to bottom, #1d4ed8, #059669)",
      image: "/images/blueberry_matcha_bottle.png",
      benefits: [
        "Ceremonial-grade Japanese Uji Matcha",
        "Packed with blueberry anthocyanins",
        "L-Theanine from matcha for relaxed focus",
        "Subtle lavender infusion for stress relief"
      ],
      taste: [
        { label: "Sweetness", value: "60%" },
        { label: "Tanginess", value: "40%" },
        { label: "Energy", value: "90%" }
      ],
      emojis: ['🫐', '🍵', '🍃', '✨']
    }
  };

  const modalOverlay = document.getElementById('flavor-modal');
  const modalContainer = modalOverlay.querySelector('.flavor-modal-container');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  
  const modalGlow = document.getElementById('modal-glow');
  const modalImage = document.getElementById('modal-image');
  const modalBadge = document.getElementById('modal-badge');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalPrice = document.getElementById('modal-price');
  const modalCalories = document.getElementById('modal-calories');
  const modalRating = document.getElementById('modal-rating');
  const modalBenefits = document.getElementById('modal-benefits');
  const modalTasteMeters = document.getElementById('modal-taste-meters');
  const modalBuyBtn = document.getElementById('modal-buy-btn');

  let activeThemeClass = '';
  let activeFlavorKey = '';

  const openFlavorModal = (flavorKey) => {
    const data = flavorData[flavorKey];
    if (!data) return;

    activeFlavorKey = flavorKey;

    // Remove any previous theme class
    if (activeThemeClass) {
      modalContainer.classList.remove(activeThemeClass);
    }
    
    // Add new theme class
    activeThemeClass = data.themeClass;
    modalContainer.classList.add(activeThemeClass);

    // Populate data fields
    modalGlow.style.background = data.glowBg;
    modalImage.src = data.image;
    modalImage.alt = data.title;
    modalBadge.innerText = data.badge;
    modalTitle.innerText = data.title;
    modalDesc.innerText = data.desc;
    modalPrice.innerText = data.price;
    modalCalories.innerText = data.calories;
    modalRating.innerText = data.rating;

    // Populate Benefits
    modalBenefits.innerHTML = '';
    data.benefits.forEach(benefit => {
      const li = document.createElement('li');
      li.innerText = benefit;
      modalBenefits.appendChild(li);
    });

    // Populate Taste Meters
    modalTasteMeters.innerHTML = '';
    data.taste.forEach(t => {
      const row = document.createElement('div');
      row.className = 'taste-meter-row';
      row.innerHTML = `
        <span class="taste-label">${t.label}</span>
        <div class="taste-bar"><span class="taste-fill" style="width: ${t.value}"></span></div>
      `;
      modalTasteMeters.appendChild(row);
    });

    // Display modal
    modalOverlay.classList.remove('hide');
    document.body.style.overflow = 'hidden'; // prevent page scroll
  };

  const closeFlavorModal = () => {
    modalOverlay.classList.add('hide');
    document.body.style.overflow = '';
  };

  // Attach triggers for all card detail buttons
  document.querySelectorAll('.btn-card-details').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const flavorKey = btn.getAttribute('data-open-modal');
      openFlavorModal(flavorKey);
    });
  });

  // Close handlers
  modalCloseBtn.addEventListener('click', closeFlavorModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeFlavorModal();
    }
  });

  // Handle buy buttons navigation to preorder form
  const navigateToPreorder = (flavorKey) => {
    closeFlavorModal();
    
    // Smooth scroll to preorder section
    const preorderSection = document.getElementById('preorder');
    if (preorderSection) {
      preorderSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Set dropdown value
    const flavorSelect = document.getElementById('flavor-preference');
    if (flavorSelect && flavorKey) {
      flavorSelect.value = flavorKey;
    }
  };

  // Buy button inside modal
  modalBuyBtn.addEventListener('click', () => {
    navigateToPreorder(activeFlavorKey);
  });

  // Buy buttons inside each flavor card
  document.querySelectorAll('.flavor-card').forEach(card => {
    const buyBtn = card.querySelector('.btn-card-cta');
    const flavorKey = card.getAttribute('data-flavor');
    
    if (buyBtn && flavorKey) {
      buyBtn.addEventListener('click', () => {
        navigateToPreorder(flavorKey);
      });
    }

    // Interactive Floating Particles on Hover
    const emojis = flavorData[flavorKey]?.emojis || ['✨', '🍃'];
    let particleInterval = null;

    const spawnCardParticle = () => {
      const particle = document.createElement('span');
      particle.className = 'floating-particle';
      particle.innerText = emojis[Math.floor(Math.random() * emojis.length)];
      
      // Position randomly at the bottom area of the card
      const randomLeft = Math.random() * 60 + 20; // 20% to 80%
      particle.style.left = `${randomLeft}%`;
      particle.style.bottom = `40px`;
      
      // Add random delay and speed subtle variations
      const duration = 1 + Math.random() * 0.8; // 1s to 1.8s
      particle.style.animationDuration = `${duration}s`;
      
      card.appendChild(particle);
      
      // Clean up
      setTimeout(() => {
        particle.remove();
      }, duration * 1000);
    };

    card.addEventListener('mouseenter', () => {
      // Immediate burst of particles
      for (let i = 0; i < 3; i++) {
        setTimeout(spawnCardParticle, i * 150);
      }
      // Periodic spawn during hover
      particleInterval = setInterval(spawnCardParticle, 400);
    });

    card.addEventListener('mouseleave', () => {
      if (particleInterval) {
        clearInterval(particleInterval);
        particleInterval = null;
      }
    });
  });

  // 9. Dark Mode Toggle Handler
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
});
