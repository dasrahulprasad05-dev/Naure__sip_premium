/* ==========================================================================
   NatureSip Quiz Controller
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

  // 2. Quiz Configuration & Data
  const questions = [
    {
      text: "What is your primary wellness goal today?",
      options: [
        { text: "Calming focus & mental relaxation 🧘", values: { matcha: 2, watermelon: 1 } },
        { text: "Rapid muscle recovery & hydration 🏃", values: { watermelon: 2, pomegranate: 1 } },
        { text: "Boosting immunity & citrus energy 🍊", values: { orange: 2, mixed: 1 } },
        { text: "Indulgent mood lift & pure sweetness 🥭", values: { mango: 2, mixed: 1 } }
      ]
    },
    {
      text: "Which taste profile matches your mood?",
      options: [
        { text: "Velvety tropical mango nectar 🥭", values: { mango: 2, mixed: 1 } },
        { text: "Zesty orange and citrus tang 🍊", values: { orange: 2, pomegranate: 1 } },
        { text: "Refreshing, crisp watermelon and mint 🍉", values: { watermelon: 2, matcha: 1 } },
        { text: "Deep complex berries & red nectar 🍷", values: { pomegranate: 2, mixed: 1 } }
      ]
    },
    {
      text: "At what time of day do you seek rejuvenation?",
      options: [
        { text: "Morning kickstart - alert and ready ☀️", values: { orange: 2, mixed: 1 } },
        { text: "Midday slump - battery recharger ⚡", values: { mango: 2, pomegranate: 1 } },
        { text: "Post-workout - cooling recovery 🏋️", values: { watermelon: 2 } },
        { text: "Evening unwind - relaxed clarity 🌙", values: { matcha: 2 } }
      ]
    }
  ];

  const flavorDetails = {
    mango: {
      title: "Alphonso Mango Royale",
      badge: "Best Seller 🏆",
      themeClass: "mango-theme",
      desc: "You are Alphonso Mango Royale! You enjoy premium, luxurious sweetness and love to elevate your mood with rich tropical treats. Your match supports digestive health, supplies vitamins A & C, and offers pure velvet organic bliss.",
      price: "$24.99",
      calories: "52 Kcal",
      rating: "4.9 ★",
      glowBg: "#f59e0b",
      image: "./public/images/mango_bottle.png",
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
      ]
    },
    orange: {
      title: "Nagpur Orange Burst",
      badge: "Signature Blend 🍊",
      themeClass: "orange-theme",
      desc: "You are Nagpur Orange Burst! You seek clean energy and a strong immune foundation. Your match packs fresh pulpy citrus zest, providing 100% of your daily required Vitamin C to build a natural body shield.",
      price: "$22.99",
      calories: "48 Kcal",
      rating: "4.8 ★",
      glowBg: "#ea580c",
      image: "./public/images/orange_bottle.png",
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
      ]
    },
    mixed: {
      title: "Mixed Fruit Supreme",
      badge: "Most Popular 🔥",
      themeClass: "mixed-theme",
      desc: "You are Mixed Fruit Supreme! You love complexity and require the full spectrum of vital nutrients for all-day active wellness. Your match blends mango, orange, apples, and forest berries for high antioxidant support.",
      price: "$25.99",
      calories: "45 Kcal",
      rating: "4.9 ★",
      glowBg: "linear-gradient(to bottom, #d97706, #db2777)",
      image: "./public/images/mixed_fruit_bottle.png",
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
      ]
    },
    pomegranate: {
      title: "Pomegranate Power",
      badge: "Antioxidant Rich 🍷",
      themeClass: "pomegranate-theme",
      desc: "You are Pomegranate Power! You value physical endurance, heart health, and anti-aging antioxidants. Your match features rich cold-pressed pomegranate seeds filled with polyphenols to revitalize blood cells and combat fatigue.",
      price: "$26.99",
      calories: "58 Kcal",
      rating: "4.7 ★",
      glowBg: "#dc2626",
      image: "./public/images/pomegranate_bottle.png",
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
      ]
    },
    watermelon: {
      title: "Watermelon Chill",
      badge: "Summer Special 🍉",
      themeClass: "watermelon-theme",
      desc: "You are Watermelon Chill! You prioritize intense workouts, hydration, and clean recovery. Your match provides low-calorie hydration infused with organic mint leaves and L-Citrulline to flush out post-exercise fatigue.",
      price: "$21.99",
      calories: "38 Kcal",
      rating: "4.8 ★",
      glowBg: "#f43f5e",
      image: "./public/images/watermelon_bottle.png",
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
      ]
    },
    matcha: {
      title: "Blueberry Matcha Spark",
      badge: "Coming Soon ⏳",
      themeClass: "matcha-theme",
      desc: "You are Blueberry Matcha Spark! You seek mindfulness, calm clarity, and jitter-free clean focus. Your match blends sweet wild blueberries, ceremonial Uji Matcha, and organic lavender to melt stress and support alert relaxation.",
      price: "$27.99",
      calories: "42 Kcal",
      rating: "5.0 ★",
      glowBg: "linear-gradient(to bottom, #1d4ed8, #059669)",
      image: "./public/images/blueberry_matcha_bottle.png",
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
      ]
    }
  };

  // 3. Quiz State Management
  let currentQuestionIndex = 0;
  let scoreTracker = {
    mango: 0,
    orange: 0,
    mixed: 0,
    pomegranate: 0,
    watermelon: 0,
    matcha: 0
  };
  let selectedFlavorResult = '';

  const frameIntro = document.getElementById('quiz-intro');
  const frameQuestion = document.getElementById('quiz-question');
  const frameLoading = document.getElementById('quiz-loading');
  const frameResult = document.getElementById('quiz-result');

  const startBtn = document.getElementById('start-quiz-btn');
  const questionCounter = document.getElementById('quiz-question-counter');
  const progressBarFill = document.getElementById('quiz-progress-fill');
  const questionText = document.getElementById('quiz-question-text');
  const optionsGrid = document.getElementById('quiz-options-grid');

  const loadingFruit = document.getElementById('loading-fruit-spinner');
  const loadingStatusText = document.getElementById('loading-status-text');

  // Trigger Quiz Start
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      frameIntro.classList.add('hide');
      frameQuestion.classList.remove('hide');
      loadQuestion(0);
    });
  }

  // Load Question State
  const loadQuestion = (index) => {
    currentQuestionIndex = index;
    const qData = questions[index];

    // Update Counter & Progress Bar
    questionCounter.innerText = `Question ${index + 1} of ${questions.length}`;
    const progressPercent = ((index + 1) / questions.length) * 100;
    progressBarFill.style.width = `${progressPercent}%`;

    // Set Question Text
    questionText.innerText = qData.text;

    // Render Option Choices
    optionsGrid.innerHTML = '';
    qData.options.forEach(option => {
      const optButton = document.createElement('button');
      optButton.className = 'quiz-option-btn glass-card';
      optButton.innerText = option.text;
      
      optButton.addEventListener('click', () => {
        // Record points
        for (const [flavor, points] of Object.entries(option.values)) {
          scoreTracker[flavor] += points;
        }

        // Navigate
        if (currentQuestionIndex + 1 < questions.length) {
          loadQuestion(currentQuestionIndex + 1);
        } else {
          showResultsLoading();
        }
      });
      optionsGrid.appendChild(optButton);
    });
  };

  // Show Loading Phase with rotating messages
  const showResultsLoading = () => {
    frameQuestion.classList.add('hide');
    frameLoading.classList.remove('hide');

    const loadingPhrases = [
      "Harvesting wild berry antioxidants...",
      "Squeezing fresh Nagpur oranges...",
      "Shaking up organic mint leaves...",
      "Steeping ceremonial Japanese Matcha...",
      "Cold-pressing ruby pomegranate seeds..."
    ];
    const fruits = ["🍒", "🥭", "🍊", "🍓", "🍉", "🍇", "🍵"];

    let phraseIndex = 0;
    let fruitIndex = 0;

    const cycleLoading = setInterval(() => {
      phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
      fruitIndex = (fruitIndex + 1) % fruits.length;

      loadingStatusText.innerText = loadingPhrases[phraseIndex];
      loadingFruit.innerText = fruits[fruitIndex];
    }, 500);

    setTimeout(() => {
      clearInterval(cycleLoading);
      displayResults();
    }, 2500);
  };

  // Find max scored flavor and display
  const displayResults = () => {
    frameLoading.classList.add('hide');
    frameResult.classList.remove('hide');

    // Calculate maximum score key
    let maxScore = -1;
    let winner = 'mango'; // default fallback
    for (const [flavor, score] of Object.entries(scoreTracker)) {
      if (score > maxScore) {
        maxScore = score;
        winner = flavor;
      }
    }
    selectedFlavorResult = winner;
    const data = flavorDetails[winner];

    // Populate Fields
    document.getElementById('result-flavor-name').innerText = data.title;
    document.getElementById('result-badge').innerText = data.badge;
    document.getElementById('result-desc').innerText = data.desc;
    document.getElementById('result-price').innerText = data.price;
    document.getElementById('result-calories').innerText = data.calories;
    document.getElementById('result-rating').innerText = data.rating;
    document.getElementById('result-image').src = data.image;
    document.getElementById('result-image').alt = data.title;
    document.getElementById('result-glow').style.background = data.glowBg;

    // Reset results visual wrapper theme
    const resultVisualWrapper = document.querySelector('.result-visual');
    // Clear theme classes
    ['mango-theme', 'orange-theme', 'mixed-theme', 'pomegranate-theme', 'watermelon-theme', 'matcha-theme'].forEach(cls => {
      resultVisualWrapper.classList.remove(cls);
    });
    resultVisualWrapper.classList.add(data.themeClass);

    // Populate Benefits
    const benefitsList = document.getElementById('result-benefits');
    benefitsList.innerHTML = '';
    data.benefits.forEach(benefit => {
      const li = document.createElement('li');
      li.innerText = benefit;
      benefitsList.appendChild(li);
    });

    // Populate Taste Profile
    const tasteMeters = document.getElementById('result-taste-meters');
    tasteMeters.innerHTML = '';
    data.taste.forEach(t => {
      const row = document.createElement('div');
      row.className = 'taste-meter-row';
      row.innerHTML = `
        <span class="taste-label">${t.label}</span>
        <div class="taste-bar">
          <span class="taste-fill" style="width: 0%; background: ${winner === 'matcha' ? 'linear-gradient(90deg, #1d4ed8, #059669)' : ''}"></span>
        </div>
      `;
      tasteMeters.appendChild(row);
      
      // Animating taste fills inside timeout for smoothness
      setTimeout(() => {
        const fill = row.querySelector('.taste-fill');
        fill.style.width = t.value;
      }, 150);
    });
  };

  // 4. Email capturing discount handler
  const emailForm = document.getElementById('quiz-email-form');
  const emailInput = document.getElementById('quiz-user-email');
  const emailError = document.getElementById('quiz-email-error');
  const successContainer = document.getElementById('quiz-offer-success');

  if (emailForm) {
    emailForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailVal = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(emailVal)) {
        emailInput.classList.add('invalid');
        emailError.style.opacity = '1';
        emailError.style.height = 'auto';
      } else {
        emailInput.classList.remove('invalid');
        emailError.style.opacity = '0';
        emailError.style.height = '0';

        // Copy coupon code to clipboard
        navigator.clipboard.writeText("SIPMATCH15").then(() => {
          emailForm.classList.add('hide');
          setTimeout(() => {
            emailForm.style.display = 'none';
            successContainer.classList.remove('hide');
          }, 300);
        }).catch(err => {
          // Fallback if copy blocked
          emailForm.classList.add('hide');
          setTimeout(() => {
            emailForm.style.display = 'none';
            successContainer.classList.remove('hide');
          }, 300);
        });
      }
    });
  }

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      emailInput.classList.remove('invalid');
      emailError.style.opacity = '0';
      emailError.style.height = '0';
    });
  }

  // 5. Pre-order Nav Hook
  const buyBtn = document.getElementById('result-buy-btn');
  if (buyBtn) {
    buyBtn.addEventListener('click', () => {
      // Save result selection to localStorage for index.html auto-filling
      localStorage.setItem('preorder-flavor', selectedFlavorResult);
      window.location.href = 'index.html#preorder';
    });
  }

  // 6. Sharing clipboard URL
  const shareBtn = document.getElementById('result-share-btn');
  const toast = document.getElementById('quiz-toast');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      const shareUrl = `${window.location.origin}${window.location.pathname}?match=${selectedFlavorResult}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.classList.remove('hide');
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
          toast.classList.add('hide');
        }, 2500);
      }).catch(err => {
        console.error('Clipboard copy failed:', err);
      });
    });
  }

  // 7. Retake Reset
  const resetBtn = document.getElementById('result-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Reset State
      currentQuestionIndex = 0;
      scoreTracker = { mango: 0, orange: 0, mixed: 0, pomegranate: 0, watermelon: 0, matcha: 0 };
      selectedFlavorResult = '';

      // Reset email capture block
      if (emailForm) {
        emailForm.style.display = 'flex';
        emailForm.classList.remove('hide');
        emailForm.reset();
      }
      if (successContainer) {
        successContainer.classList.add('hide');
      }

      // Hide results, open intro
      frameResult.classList.add('hide');
      frameIntro.classList.remove('hide');
    });
  }

  // 8. Header scrolled toggle state
  const header = document.getElementById('main-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        // Keep header scrolled on quiz page for visual consistency
        header.classList.add('scrolled');
      }
    });
  }

  // 9. Mobile Nav Menu Toggle
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

  // 10. Dark Mode Switch logic
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
