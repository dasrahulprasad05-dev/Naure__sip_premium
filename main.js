/* ==========================================================================
   NatureSip Premium JavaScript Controller
   ========================================================================== */
import { initAuth, showToast } from './auth.js';


const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://naure-sip-premium.onrender.com/api';

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

    // 1. Setup Reviews visibility depending on authentication status
    const token = localStorage.getItem('token');
    const addReviewBox = document.getElementById('modal-add-review-box');
    const reviewAuthPrompt = document.getElementById('modal-review-auth-prompt');

    if (token) {
      if (addReviewBox) addReviewBox.style.display = 'block';
      if (reviewAuthPrompt) reviewAuthPrompt.classList.add('hide');
    } else {
      if (addReviewBox) addReviewBox.style.display = 'none';
      if (reviewAuthPrompt) reviewAuthPrompt.classList.remove('hide');
    }

    // Bind sign in click inside prompt
    const reviewLoginTrigger = document.getElementById('review-login-trigger');
    if (reviewLoginTrigger) {
      reviewLoginTrigger.onclick = (e) => {
        e.preventDefault();
        closeFlavorModal();
        document.getElementById('nav-signin-btn')?.click();
      };
    }

    // 2. Fetch and render reviews from backend
    const productId = FLAVOR_TO_PRODUCT_ID[flavorKey];
    const reviewsListContainer = document.getElementById('modal-reviews-list');

    if (reviewsListContainer && productId) {
      reviewsListContainer.innerHTML = '<div class="loading-state-mini">⏳ Fetching feedback...</div>';

      fetch(`${API_URL}/reviews/product/${productId}`)
        .then(res => res.json())
        .then(resData => {
          if (resData.status === 'success') {
            // Update modal average rating badge
            if (resData.average_rating !== undefined && resData.average_rating > 0) {
              modalRating.innerText = `${parseFloat(resData.average_rating).toFixed(1)} ★`;
            } else {
              modalRating.innerText = 'N/A ★';
            }

            if (!resData.reviews || resData.reviews.length === 0) {
              reviewsListContainer.innerHTML = '<p class="no-reviews-msg">No reviews yet. Be the first to rate this flavor!</p>';
              return;
            }

            reviewsListContainer.innerHTML = resData.reviews.map(rev => {
              const starsHtml = '★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating);
              const dateStr = new Date(rev.created_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
              });
              const nameText = rev.reviewer_name || 'Verified Customer';
              const commentText = rev.comment || '';

              return `
                <div class="modal-review-card">
                  <div class="review-card-meta">
                    <span class="reviewer-name">${nameText}</span>
                    <span class="review-stars-render">${starsHtml}</span>
                  </div>
                  <span class="review-date-label">${dateStr}</span>
                  <p class="review-content-body">${commentText}</p>
                </div>
              `;
            }).join('');
          } else {
            reviewsListContainer.innerHTML = '<p class="error-reviews-msg">Could not load ratings ledger.</p>';
          }
        })
        .catch(err => {
          console.error(err);
          reviewsListContainer.innerHTML = '<p class="error-reviews-msg">Network error loading reviews.</p>';
        });
    }

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

  const FLAVOR_TO_PRODUCT_ID = {
    'mango': 'a0f1b2c3-d4e5-4f6a-9b0c-1d2e3f4a5b6c',
    'orange': 'b1f2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    'mixed': 'c2f3d4e5-f6a7-4b8c-9d0e-1f2a-3b4c5d6e7f8a',
    'pomegranate': 'd3f4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
    'watermelon': 'e4f5e6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
    'matcha': 'f5f6e7a8-b9c0-4d1e-2f3a-4b5c6d7e8f9a',
    'custom': '06f7e8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a'
  };

  // Handle buy buttons adding to cart
  const handleBuyClick = (flavorKey) => {
    closeFlavorModal();
    const productId = FLAVOR_TO_PRODUCT_ID[flavorKey];
    if (productId) {
      window.addItemToCart(productId, null, 1);
    }
  };

  // Buy button inside modal
  modalBuyBtn.addEventListener('click', () => {
    handleBuyClick(activeFlavorKey);
  });

  // Buy buttons inside each flavor card
  document.querySelectorAll('.flavor-card').forEach(card => {
    const buyBtn = card.querySelector('.btn-card-cta');
    const flavorKey = card.getAttribute('data-flavor');
    
    if (buyBtn && flavorKey) {
      buyBtn.addEventListener('click', () => {
        handleBuyClick(flavorKey);
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

  // 10. Shopping Cart Functionality & Event Handlers
  const cartDrawer = document.getElementById('cart-drawer');
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const cartCloseBtn = document.getElementById('cart-drawer-close-btn');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartCountBadge = document.getElementById('cart-count-badge');
  const cartDrawerCount = document.getElementById('cart-drawer-count');
  const cartDrawerFooter = document.getElementById('cart-drawer-footer');
  const cartDrawerSubtotal = document.getElementById('cart-drawer-subtotal');
  const cartClearBtn = document.getElementById('cart-clear-btn');
  const cartCheckoutBtn = document.getElementById('cart-checkout-btn');

  let cart = { items: [], subtotal: 0, total_items: 0 };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const isUserLoggedIn = () => {
    return !!localStorage.getItem('token');
  };

  const showCartDrawer = () => {
    if (!isUserLoggedIn()) {
      // Trigger sign-in modal
      document.getElementById('nav-signin-btn')?.click();
      document.getElementById('mobile-signin-btn')?.click();
      alert("Please sign in to access your shopping cart 🛒");
      return;
    }
    cartDrawer.classList.remove('hide');
    document.body.style.overflow = 'hidden';
    fetchCart();
  };

  const hideCartDrawer = () => {
    cartDrawer.classList.add('hide');
    document.body.style.overflow = '';
  };

  const updateCartBadgeUI = () => {
    if (!isUserLoggedIn()) {
      cartCountBadge.classList.add('hide');
      return;
    }
    const totalItems = cart.total_items;
    if (totalItems > 0) {
      cartCountBadge.innerText = totalItems;
      cartCountBadge.classList.remove('hide');
    } else {
      cartCountBadge.classList.add('hide');
    }
  };

  const fetchCart = () => {
    if (!isUserLoggedIn()) return;
    fetch(`${API_URL}/cart`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        cart = data.cart;
        renderCart();
      }
    })
    .catch(err => console.error("Error fetching cart:", err));
  };

  const renderCart = () => {
    cartDrawerCount.innerText = cart.total_items;
    updateCartBadgeUI();

    if (!cart.items || cart.items.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart-message">
          <span class="empty-cart-icon">🛒</span>
          <p>Your shopping cart is currently empty.</p>
          <button id="cart-back-shopping" class="btn btn-secondary btn-sm">Start Shopping</button>
        </div>
      `;
      cartDrawerFooter.classList.add('hide');
      
      // Hook the back to shopping button
      document.getElementById('cart-back-shopping')?.addEventListener('click', hideCartDrawer);
      return;
    }

    cartDrawerFooter.classList.remove('hide');
    cartDrawerSubtotal.innerText = `$${parseFloat(cart.subtotal).toFixed(2)}`;

    cartItemsContainer.innerHTML = cart.items.map(item => {
      const img = item.image_url || '/images/custom_bottle.png';
      const name = item.name || item.blend_name || 'NatureSip Blend';
      const sku = item.sku || 'NS-CUSTOM';
      const price = parseFloat(item.price).toFixed(2);
      return `
        <div class="cart-item-card">
          <div class="cart-item-img-wrapper">
            <img src="${img}" alt="${name}">
          </div>
          <div class="cart-item-details">
            <h4 class="cart-item-name">${name}</h4>
            <span class="cart-item-sku">${sku}</span>
            <span class="cart-item-price">$${price}</span>
            <div class="cart-qty-control">
              <button class="cart-qty-btn decrease-qty-btn" data-id="${item.id}" data-qty="${item.quantity}">-</button>
              <span class="cart-qty-val">${item.quantity}</span>
              <button class="cart-qty-btn increase-qty-btn" data-id="${item.id}" data-qty="${item.quantity}">+</button>
            </div>
          </div>
          <div class="cart-item-actions">
            <button class="cart-item-remove-btn" data-id="${item.id}">&times;</button>
          </div>
        </div>
      `;
    }).join('');

    bindCartItemEvents();
  };

  const bindCartItemEvents = () => {
    // Decrease Quantity
    cartItemsContainer.querySelectorAll('.decrease-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-id');
        const currentQty = parseInt(btn.getAttribute('data-qty'));
        if (currentQty <= 1) {
          deleteCartItem(itemId);
        } else {
          updateCartItemQty(itemId, currentQty - 1);
        }
      });
    });

    // Increase Quantity
    cartItemsContainer.querySelectorAll('.increase-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-id');
        const currentQty = parseInt(btn.getAttribute('data-qty'));
        updateCartItemQty(itemId, currentQty + 1);
      });
    });

    // Remove Item
    cartItemsContainer.querySelectorAll('.cart-item-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const itemId = btn.getAttribute('data-id');
        deleteCartItem(itemId);
      });
    });
  };

  const updateCartItemQty = (itemId, newQty) => {
    fetch(`${API_URL}/cart/${itemId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity: newQty })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        fetchCart();
      } else {
        alert(data.message || "Could not update quantity.");
      }
    })
    .catch(err => console.error("Error updating qty:", err));
  };

  const deleteCartItem = (itemId) => {
    fetch(`${API_URL}/cart/${itemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        fetchCart();
      }
    })
    .catch(err => console.error("Error deleting item:", err));
  };

  const clearCart = () => {
    fetch(`${API_URL}/cart`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        fetchCart();
      }
    })
    .catch(err => console.error("Error clearing cart:", err));
  };

  // Add Item to Cart API Call
  window.addItemToCart = (productId, customJuiceId, quantity = 1) => {
    if (!isUserLoggedIn()) {
      document.getElementById('nav-signin-btn')?.click();
      document.getElementById('mobile-signin-btn')?.click();
      showToast("Please sign in to add items to your cart 🛒");
      return;
    }

    fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        product_id: productId,
        custom_juice_id: customJuiceId,
        quantity
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        showToast("Product added to cart! 🛒");
        fetchCart();
        showCartDrawer();
      } else {
        showToast(data.message || "Failed to add to cart.");
      }
    })
    .catch(err => console.error("Error adding to cart:", err));
  };


  // Listeners
  cartToggleBtn?.addEventListener('click', showCartDrawer);
  cartCloseBtn?.addEventListener('click', hideCartDrawer);
  cartDrawer?.addEventListener('click', (e) => {
    if (e.target === cartDrawer) hideCartDrawer();
  });

  cartClearBtn?.addEventListener('click', clearCart);

  // Cart Checkout flow (Direct integration with multi-item checkout API)
  cartCheckoutBtn?.addEventListener('click', () => {
    if (!cart.items || cart.items.length === 0) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      document.getElementById('nav-signin-btn')?.click();
      alert("Please sign in to proceed with checkout.");
      return;
    }

    const oldBtnText = cartCheckoutBtn.innerText;
    cartCheckoutBtn.disabled = true;
    cartCheckoutBtn.innerText = "Processing checkout...";

    fetch(`${API_URL}/orders/checkout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: currentUser.name,
        email: currentUser.email
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        if (data.checkout_url) {
          hideCartDrawer();
          window.location.href = data.checkout_url;
        } else {
          alert("Order created successfully! Redirect URL is missing in mock configuration.");
          hideCartDrawer();
        }
      } else {
        alert(data.message || "Failed to process cart checkout.");
      }
    })
    .catch(err => {
      console.error("Cart checkout error:", err);
      alert("Failed to reach checkout service. Please check your network connection.");
    })
    .finally(() => {
      cartCheckoutBtn.disabled = false;
      cartCheckoutBtn.innerText = oldBtnText;
    });
  });

  // Submit product review ratings and comments
  const productReviewForm = document.getElementById('product-review-form');
  productReviewForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please sign in to submit reviews.");
      return;
    }

    const productId = FLAVOR_TO_PRODUCT_ID[activeFlavorKey];
    if (!productId) return;

    const ratingRadio = productReviewForm.querySelector('input[name="review-rating"]:checked');
    const commentText = document.getElementById('review-comment').value.trim();

    if (!ratingRadio) {
      alert("Please select a rating score between 1 and 5 stars.");
      return;
    }

    const ratingValue = ratingRadio.value;
    const submitBtn = document.getElementById('submit-review-btn');
    submitBtn.disabled = true;
    submitBtn.innerText = "Submitting review...";

    fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        product_id: productId,
        rating: ratingValue,
        comment: commentText
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        alert("Thank you! Your product review has been logged.");
        productReviewForm.reset();
        openFlavorModal(activeFlavorKey); // Refresh reviews list
      } else {
        alert(data.message || "Could not save your review.");
      }
    })
    .catch(err => {
      console.error("Submit review error:", err);
      alert("Network error submitting review.");
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.innerText = "Submit Review";
    });
  });

  // Fetch cart initially on load to sync navbar badge count
  if (isUserLoggedIn()) {
    fetchCart();
  }

  // Bind cart refresh state globally for dashboard actions
  window.refreshCartState = fetchCart;

  // Intercept authentication flow to refetch cart when user signs in or out
  window.onAuthChange = () => {
    if (isUserLoggedIn()) {
      fetchCart();
    } else {
      cart = { items: [], subtotal: 0, total_items: 0 };
      updateCartBadgeUI();
      hideCartDrawer();
    }
  };

});
