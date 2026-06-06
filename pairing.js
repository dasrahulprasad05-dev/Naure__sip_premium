/* ==========================================================================
   NatureSip Pairing Guide Controller - Enhanced Animation Edition
   ========================================================================== */
import { initAuth } from './auth.js';

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

  // 2. Expand Meal and Juice Synergy Data (15 Meals)
  const pairingData = {
    avocado: {
      mealEmoji: "🥑",
      flavorKey: "pomegranate",
      juiceTitle: "Pomegranate Power",
      juiceBadge: "Antioxidant Rich 🍷",
      juiceImage: "/images/pomegranate_bottle.png",
      glowBg: "#dc2626",
      synergySummary: "Avocado Toast's healthy monounsaturated fats dramatically boost the absorption of pomegranate's oil-soluble antioxidants and cardiovascular polyphenols.",
      boostVal: 85,
      boostSuffix: "% Synergy",
      bullets: [
        "Healthy plant lipids in Avocado enhance the bio-availability of Pomegranate polyphenols.",
        "The deep, mildly tart pomegranate juice cuts through the rich creaminess of the ripe avocado.",
        "Supplies natural potassium and active iron to help balance daily cellular fluids."
      ],
      taste: [
        { label: "Sweetness", value: "55%" },
        { label: "Tanginess", value: "75%" },
        { label: "Energy", value: "90%" }
      ]
    },
    quinoa: {
      mealEmoji: "🥗",
      flavorKey: "mango",
      juiceTitle: "Alphonso Mango Royale",
      juiceBadge: "Best Seller 🏆",
      juiceImage: "/images/mango_bottle.png",
      glowBg: "#f59e0b",
      synergySummary: "The slow-digesting complex carbohydrates in the Quinoa bowl combine with mango's natural digestive enzymes, ensuring sustained metabolic energy release without spikes.",
      boostVal: 70,
      boostSuffix: "% Energy Synergy",
      bullets: [
        "Mango amylase enzymes help break down complex starch fibers from quinoa and seeds.",
        "Rich mango sweetness provides an elegant contrast to earthy quinoa grains and dark leafy greens.",
        "High vitamin A content supports digestive tract lining health."
      ],
      taste: [
        { label: "Sweetness", value: "90%" },
        { label: "Tanginess", value: "30%" },
        { label: "Energy", value: "85%" }
      ]
    },
    salmon: {
      mealEmoji: "🐟",
      flavorKey: "watermelon",
      juiceTitle: "Watermelon Chill",
      juiceBadge: "Summer Special 🍉",
      juiceImage: "/images/watermelon_bottle.png",
      glowBg: "#f43f5e",
      synergySummary: "Watermelon's natural L-Citrulline combined with salmon's pure Omega-3 fatty acids creates a powerful anti-inflammatory duo, accelerating physical muscle recovery post-exertion.",
      boostVal: 95,
      boostSuffix: "% Recovery Synergy",
      bullets: [
        "L-Citrulline aids nitric oxide production, expanding blood vessels for faster fish oil nutrient absorption.",
        "Organic mint leaves cool and refresh the palate after the rich, savory omega fat profiles of grilled salmon.",
        "High hydration base flushes lactic acid, facilitating rapid cellular protein synthesis."
      ],
      taste: [
        { label: "Sweetness", value: "80%" },
        { label: "Tanginess", value: "20%" },
        { label: "Energy", value: "70%" }
      ]
    },
    tofu: {
      mealEmoji: "🍳",
      flavorKey: "orange",
      juiceTitle: "Nagpur Orange Burst",
      juiceBadge: "Signature Blend 🍊",
      juiceImage: "/images/orange_bottle.png",
      glowBg: "#ea580c",
      synergySummary: "Orange juice's high Vitamin C (ascorbic acid) changes the chemical structure of non-heme iron found in spinach and tofu, increasing iron absorption in your gut by up to 300%.",
      boostVal: 300,
      boostSuffix: "% Iron Bio-availability",
      bullets: [
        "Vitamin C binds with dietary iron, turning it into a highly soluble compound for rapid absorption.",
        "The zesty, sharp citrus acidity cuts through spice and helps cleanse the palate.",
        "Provides dynamic cellular hydration to boost kidney filtration."
      ],
      taste: [
        { label: "Sweetness", value: "70%" },
        { label: "Tanginess", value: "80%" },
        { label: "Energy", value: "75%" }
      ]
    },
    acai: {
      mealEmoji: "🍧",
      flavorKey: "matcha",
      juiceTitle: "Blueberry Matcha Spark",
      juiceBadge: "Coming Soon 🍵",
      juiceImage: "/images/blueberry_matcha_bottle.png",
      glowBg: "linear-gradient(to bottom, #1d4ed8, #059669)",
      synergySummary: "Blueberry antioxidants mixed with ceremonial matcha's L-Theanine and acai polyphenols create an ultimate cognitive shield, boosting alpha brain waves for calm, stress-free focus.",
      boostVal: 90,
      boostSuffix: "% Focus Synergy",
      bullets: [
        "L-Theanine creates relaxed focus, balancing the raw antioxidant rush from acai and blueberries.",
        "Anthocyanins cross the blood-brain barrier, working together with matcha catechins.",
        "Low glycemic load keeps mind sharp and steady without afternoon crashes."
      ],
      taste: [
        { label: "Sweetness", value: "60%" },
        { label: "Tanginess", value: "40%" },
        { label: "Energy", value: "90%" }
      ]
    },
    greek: {
      mealEmoji: "🥗",
      flavorKey: "watermelon",
      juiceTitle: "Watermelon Chill",
      juiceBadge: "Summer Special 🍉",
      juiceImage: "/images/watermelon_bottle.png",
      glowBg: "#f43f5e",
      synergySummary: "Crisp cucumbers and tomatoes provide raw potassium, while watermelon's high hydration and organic mint leaves facilitate rapid electrolyte assimilation and muscle cooling.",
      boostVal: 80,
      boostSuffix: "% Hydration Synergy",
      bullets: [
        "High water volume base flushes sodium, soothing physical muscle soreness.",
        "Cooling organic mint balances the rich, salty profile of Greek feta cheese.",
        "Drip-sourced minerals support rapid heart rate recovery post-workout."
      ],
      taste: [
        { label: "Sweetness", value: "80%" },
        { label: "Tanginess", value: "20%" },
        { label: "Energy", value: "70%" }
      ]
    },
    oatmeal: {
      mealEmoji: "🥣",
      flavorKey: "mango",
      juiceTitle: "Alphonso Mango Royale",
      juiceBadge: "Best Seller 🏆",
      juiceImage: "/images/mango_bottle.png",
      glowBg: "#f59e0b",
      synergySummary: "Oats supply slow-release beta-glucan fibers, which modulate mango's rich fructose sugars for sustained, non-spiking organic energy.",
      boostVal: 75,
      boostSuffix: "% Energy Synergy",
      bullets: [
        "Soluble fiber grid locks simple sugars, smoothing out glucose metabolism.",
        "Rich velvet mango nectar turns plain oatmeal starch into a premium culinary treat.",
        "Supplies active plant enzymes to reduce morning digestive bloating."
      ],
      taste: [
        { label: "Sweetness", value: "90%" },
        { label: "Tanginess", value: "30%" },
        { label: "Energy", value: "85%" }
      ]
    },
    chicken: {
      mealEmoji: "🍗",
      flavorKey: "pomegranate",
      juiceTitle: "Pomegranate Power",
      juiceBadge: "Antioxidant Rich 🍷",
      juiceImage: "/images/pomegranate_bottle.png",
      glowBg: "#dc2626",
      synergySummary: "Lean chicken protein paired with pomegranate's active polyphenols optimizes cellular nitrogen retention and speeds up muscular recovery.",
      boostVal: 85,
      boostSuffix: "% Recovery Synergy",
      bullets: [
        "Cardio-polyphenols reduce post-exercise muscular inflammatory markers.",
        "Deep tart pomegranate acid profiles cut clean through clean savory protein.",
        "Supports oxygenation through high natural iron bio-availabilities."
      ],
      taste: [
        { label: "Sweetness", value: "55%" },
        { label: "Tanginess", value: "75%" },
        { label: "Energy", value: "90%" }
      ]
    },
    potato: {
      mealEmoji: "🍠",
      flavorKey: "orange",
      juiceTitle: "Nagpur Orange Burst",
      juiceBadge: "Signature Blend 🍊",
      juiceImage: "/images/orange_bottle.png",
      glowBg: "#ea580c",
      synergySummary: "Orange's high Vitamin C acts as a catalyst for sweet potato's rich beta-carotene, boosting natural vitamin A synthesis and immune health.",
      boostVal: 90,
      boostSuffix: "% Vitamin A Synergy",
      bullets: [
        "Ascorbic acid facilitates the cellular conversion of plant carotenes.",
        "Tangy orange zest cleanses heavy starch oils from the palate.",
        "Supports skin repair and respiratory tract immune health."
      ],
      taste: [
        { label: "Sweetness", value: "70%" },
        { label: "Tanginess", value: "80%" },
        { label: "Energy", value: "75%" }
      ]
    },
    chia: {
      mealEmoji: "🍮",
      flavorKey: "matcha",
      juiceTitle: "Blueberry Matcha Spark",
      juiceBadge: "Coming Soon 🍵",
      juiceImage: "/images/blueberry_matcha_bottle.png",
      glowBg: "linear-gradient(to bottom, #1d4ed8, #059669)",
      synergySummary: "Chia seeds contain essential ALA omega-3 fatty acids which support the absorption of matcha's brain-boosting EGCG catechins, enhancing memory and focus.",
      boostVal: 95,
      boostSuffix: "% Cognitive Synergy",
      bullets: [
        "Soluble fiber and omega fats slow caffeine release, eliminating any morning jitters.",
        "Uji Matcha and wild blueberry anthocyanins protect brain cells from daily stress.",
        "Sustained alert relaxation through high L-Theanine."
      ],
      taste: [
        { label: "Sweetness", value: "60%" },
        { label: "Tanginess", value: "40%" },
        { label: "Energy", value: "90%" }
      ]
    },
    hummus: {
      mealEmoji: "🥕",
      flavorKey: "mixed",
      juiceTitle: "Mixed Fruit Supreme",
      juiceBadge: "Most Popular 🔥",
      juiceImage: "/images/mixed_fruit_bottle.png",
      glowBg: "linear-gradient(to bottom, #d97706, #db2777)",
      synergySummary: "The dietary fibers in carrots and hummus act as prebiotics that feed gut microbiome, optimized by mixed fruit's raw botanical enzymes.",
      boostVal: 80,
      boostSuffix: "% Digestion Synergy",
      bullets: [
        "Multi-fruit enzymes support complex chickpea fiber digestion.",
        "Rich savory sesame tahini finds a perfect balance with berry and mango notes.",
        "Supplies a complete vitamin spectrum (A, B, C, E) in one snack."
      ],
      taste: [
        { label: "Sweetness", value: "85%" },
        { label: "Tanginess", value: "50%" },
        { label: "Energy", value: "80%" }
      ]
    },
    nuts: {
      mealEmoji: "🥜",
      flavorKey: "pomegranate",
      juiceTitle: "Pomegranate Power",
      juiceBadge: "Antioxidant Rich 🍷",
      juiceImage: "/images/pomegranate_bottle.png",
      glowBg: "#dc2626",
      synergySummary: "Walnuts and almonds supply polyunsaturated fatty acids that bind with pomegranate polyphenols, protecting your cardiovascular arterial walls.",
      boostVal: 85,
      boostSuffix: "% Cardio Synergy",
      bullets: [
        "Healthy nut fats optimize absorption of fat-soluble vitamins and polyphenols.",
        "Crisp pomegranate seed tartness offsets the dry, buttery notes of almonds.",
        "Reduces lipid oxidation markers effectively."
      ],
      taste: [
        { label: "Sweetness", value: "55%" },
        { label: "Tanginess", value: "75%" },
        { label: "Energy", value: "90%" }
      ]
    },
    kale: {
      mealEmoji: "🥬",
      flavorKey: "orange",
      juiceTitle: "Nagpur Orange Burst",
      juiceBadge: "Signature Blend 🍊",
      juiceImage: "/images/orange_bottle.png",
      glowBg: "#ea580c",
      synergySummary: "Kale is a dense source of iron, but requires ascorbic acid (Vitamin C) from Nagpur oranges to unlock absorption, raising iron uptake by up to 3x.",
      boostVal: 300,
      boostSuffix: "% Iron Bio-availability",
      bullets: [
        "Citric acid converts non-soluble plant iron into gut-absorbable compounds.",
        "Zesty citrus juice breaks down tough kale fibers, softening the flavor.",
        "High natural folates and vitamin K boost systemic oxygen circulation."
      ],
      taste: [
        { label: "Sweetness", value: "70%" },
        { label: "Tanginess", value: "80%" },
        { label: "Energy", value: "75%" }
      ]
    },
    lentils: {
      mealEmoji: "🍛",
      flavorKey: "mango",
      juiceTitle: "Alphonso Mango Royale",
      juiceBadge: "Best Seller 🏆",
      juiceImage: "/images/mango_bottle.png",
      glowBg: "#f59e0b",
      synergySummary: "Combining rice and lentils creates a complete protein containing all 9 essential amino acids, optimized by mango's high enzymatic activity.",
      boostVal: 75,
      boostSuffix: "% Amino Synthesis",
      bullets: [
        "Mango sugars supply instant glycogen to drive amino acid absorption into muscle.",
        "Smooth mango creaminess balances savory cumin spices in lentil curries.",
        "Aids gut lining wellness through soluble botanical fibers."
      ],
      taste: [
        { label: "Sweetness", value: "90%" },
        { label: "Tanginess", value: "30%" },
        { label: "Energy", value: "85%" }
      ]
    },
    omelette: {
      mealEmoji: "🍳",
      flavorKey: "orange",
      juiceTitle: "Nagpur Orange Burst",
      juiceBadge: "Signature Blend 🍊",
      juiceImage: "/images/orange_bottle.png",
      glowBg: "#ea580c",
      synergySummary: "Egg yolks provide high vitamin D and healthy lipids, which work with Nagpur orange's high Vitamin C to boost skeletal calcium deposition and overall immunity.",
      boostVal: 90,
      boostSuffix: "% Immune Synergy",
      bullets: [
        "Egg fats help assimilate fat-soluble vitamins while orange supplies citric acid.",
        "Fresh citrus tang cuts through egg richness.",
        "Excellent morning recovery pairing for joint and bone strength."
      ],
      taste: [
        { label: "Sweetness", value: "70%" },
        { label: "Tanginess", value: "80%" },
        { label: "Energy", value: "75%" }
      ]
    }
  };

  // 3. Pairing DOM Elements
  const mealButtons = document.querySelectorAll('.meal-card');
  const dinnerPlate = document.getElementById('dinner-plate');
  const mealEmojiDisplay = document.getElementById('meal-emoji-display');
  const bottlePlacement = document.getElementById('bottle-placement');
  const pairedBottleImg = document.getElementById('paired-bottle-img');
  const bottleGlow = document.getElementById('bottle-glow');

  const juiceBadge = document.getElementById('juice-badge');
  const juiceTitle = document.getElementById('juice-title');
  const synergySummaryText = document.getElementById('synergy-summary-text');
  const synergyBoostFill = document.getElementById('synergy-boost-fill');
  const synergyBoostVal = document.getElementById('synergy-boost-val');
  const synergyBulletList = document.getElementById('synergy-bullet-list');
  const pairingTasteMeters = document.getElementById('pairing-taste-meters');
  const pairOrderBtn = document.getElementById('pair-order-btn');

  let selectedFlavorResult = 'pomegranate';

  // 4. Stat Counter Animation Logic
  const animateCounter = (element, endValue, suffix = "% Synergy", duration = 800) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const val = Math.floor(progress * endValue);
      element.innerText = `+${val}${suffix}`;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.innerText = `+${endValue}${suffix}`;
      }
    };
    window.requestAnimationFrame(step);
  };

  // 5. Update Pairing UI Function
  const updatePairingUI = (mealKey) => {
    const data = pairingData[mealKey];
    if (!data) return;

    selectedFlavorResult = data.flavorKey;

    // A. Trigger Spin & Fade Animations
    dinnerPlate.classList.add('pop-animation', 'spinning-plate');
    mealEmojiDisplay.classList.add('emoji-drop-out');
    bottlePlacement.classList.add('slide-out-animation');

    // Set CSS variable for neon glow color on plate wrapper
    const plateWrapper = document.querySelector('.plate-wrapper');
    if (plateWrapper) {
      let solidGlow = data.glowBg;
      if (data.glowBg.includes('linear-gradient')) {
        solidGlow = data.flavorKey === 'matcha' ? '#10b981' : '#db2777';
      }
      plateWrapper.style.setProperty('--paired-glow-color', solidGlow);
    }

    setTimeout(() => {
      // Update values
      mealEmojiDisplay.innerText = data.mealEmoji;
      pairedBottleImg.src = data.juiceImage;
      pairedBottleImg.alt = data.juiceTitle;
      
      // Update glow color
      bottleGlow.style.background = data.glowBg;

      // Update text card contents
      juiceBadge.innerText = data.juiceBadge;
      juiceTitle.innerText = data.juiceTitle;
      
      // Text fade reveal animation trigger
      synergySummaryText.innerText = data.synergySummary;
      synergySummaryText.classList.remove('reveal-text');
      void synergySummaryText.offsetWidth; // Reflow
      synergySummaryText.classList.add('reveal-text');
      
      // Progress bar transition
      synergyBoostFill.style.width = '0%';
      setTimeout(() => {
        // Boost percentages limits capped at 100 in display gauge bars
        const limitPct = data.flavorKey === 'orange' && mealKey === 'tofu' ? 100 : (data.flavorKey === 'orange' && mealKey === 'kale' ? 100 : data.boostVal);
        synergyBoostFill.style.width = `${limitPct}%`;
      }, 50);
      
      // Counter animation trigger
      animateCounter(synergyBoostVal, data.boostVal, data.boostSuffix);

      // Update synergy bullets
      synergyBulletList.innerHTML = '';
      data.bullets.forEach((bullet, index) => {
        const li = document.createElement('li');
        li.innerText = bullet;
        li.style.animationDelay = `${index * 120}ms`;
        li.className = 'reveal-bullet';
        synergyBulletList.appendChild(li);
      });

      // Update taste meters
      pairingTasteMeters.innerHTML = '';
      data.taste.forEach(t => {
        const row = document.createElement('div');
        row.className = 'taste-meter-row';
        row.innerHTML = `
          <span class="taste-label">${t.label}</span>
          <div class="taste-bar">
            <span class="taste-fill" style="width: 0%; background: ${data.flavorKey === 'matcha' ? 'linear-gradient(90deg, #1d4ed8, #059669)' : ''}"></span>
          </div>
        `;
        pairingTasteMeters.appendChild(row);
        
        // Trigger fill animation
        setTimeout(() => {
          row.querySelector('.taste-fill').style.width = t.value;
        }, 50);
      });

      // B. Stop Spin, trigger Bounce-In / Glide animations
      dinnerPlate.classList.remove('pop-animation', 'spinning-plate');
      mealEmojiDisplay.classList.remove('emoji-drop-out');
      bottlePlacement.classList.remove('slide-out-animation');
      
      dinnerPlate.classList.add('pop-in');
      mealEmojiDisplay.classList.add('emoji-spring-drop');
      bottlePlacement.classList.add('slide-in');

      setTimeout(() => {
        dinnerPlate.classList.remove('pop-in');
        mealEmojiDisplay.classList.remove('emoji-spring-drop');
        bottlePlacement.classList.remove('slide-in');
      }, 600);

    }, 300);
  };

  // 6. Initialize active meal state
  updatePairingUI('avocado');

  // 7. Click Handler for Meal Buttons
  mealButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      mealButtons.forEach(b => b.classList.remove('active'));
      
      // Add active to current
      btn.classList.add('active');
      
      const mealKey = btn.getAttribute('data-meal');
      updatePairingUI(mealKey);
      
      // Smooth scroll the plate into view on mobile viewports
      if (window.innerWidth < 1024) {
        dinnerPlate.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // 8. Order CTA Hook (Pre-fills localStorage and redirects)
  if (pairOrderBtn) {
    pairOrderBtn.addEventListener('click', () => {
      localStorage.setItem('preorder-flavor', selectedFlavorResult);
      window.location.href = 'index.html#preorder';
    });
  }

  // 9. Dark Mode Switch logic
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

  // 10. Mobile Nav Menu Toggle
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
