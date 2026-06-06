/* ==========================================================================
   NatureSip Sourcing Map Controller - Enhanced Animation Edition
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

  // 2. Region Sourcing Data
  const regionData = {
    himalaya: {
      title: "Himalayan Foothills",
      badge: "Purity Sourced 🏔️",
      desc: "Our water base begins in the melting glaciers of the Himalayas. Naturally filtered through mineral-rich rock layers for decades, it emerges clean, pH balanced, and loaded with cellular electrolytes.",
      farmerImg: "🏔️",
      farmerName: "Local Spring Keepers",
      farmerRole: "Eco-Conservation Guild",
      farmerQuote: "\"We protect the glacial spring paths, ensuring zero chemical runoff enters the water cycle before filtration.\"",
      organicCert: "100% Natural",
      waterSystem: "Glacial Runoff",
      carbonOffset: 80,
      carbonOffsetDash: "40", // 201 * (1 - 0.80) ≈ 40
      carbonDesc: "Filtered on-site to reduce raw bulk transport weight. Offset saves 140g CO2 equivalent per shipping bottle.",
      ctaText: "Next: Konkan Mango 🥭",
      ctaTarget: "konkan",
      viewBox: [460, 130, 340, 204] // Zoom target [x, y, w, h]
    },
    konkan: {
      title: "Konkan Coast, India",
      badge: "Alphonso Mango 🥭",
      desc: "Famous for its red laterite soil and humid coastal winds, the Konkan region produces the King of Mangoes: Alphonso. We partner with small family orchards using ancient organic farming methods.",
      farmerImg: "👨‍🌾",
      farmerName: "Rajesh Gaikwad",
      farmerRole: "3rd Gen Mango Farmer",
      farmerQuote: "\"We harvest Alphonso mangoes by hand at the precise dawn hour when the sap sugars are stabilized.\"",
      organicCert: "APEDA Certified",
      waterSystem: "Drip Irrigation",
      carbonOffset: 92,
      carbonOffsetDash: "16", // 201 * (1 - 0.92) ≈ 16
      carbonDesc: "100% solar dehydrators and local processing plants offset transportation energy completely on-site.",
      ctaText: "Next: Nagpur Orange 🍊",
      ctaTarget: "nagpur",
      viewBox: [510, 240, 260, 156]
    },
    nagpur: {
      title: "Nagpur Region, India",
      badge: "Nagpur Orange 🍊",
      desc: "The deep black soils and extreme temperature fluctuations of the Deccan plateau give Nagpur oranges their sharp, trademark sweet-sour zesty balance. 100% chemical-fertilizer-free.",
      farmerImg: "👩‍🌾",
      farmerName: "Ananya Deshmukh",
      farmerRole: "Citrus Specialist",
      farmerQuote: "\"By planting wild marigolds between orange trees, we naturally repel pests without chemical pesticides.\"",
      organicCert: "NPOP Organic",
      waterSystem: "Rainwater Harvesting",
      carbonOffset: 88,
      carbonOffsetDash: "24", // 201 * (1 - 0.88) ≈ 24
      carbonDesc: "Local gravity-fed micro-canal systems minimize power requirements, saving 125g CO2 per pack.",
      ctaText: "Next: Solapur Pomegranate 🍷",
      ctaTarget: "solapur",
      viewBox: [530, 230, 260, 156]
    },
    solapur: {
      title: "Solapur Valley, India",
      badge: "Solapur Pomegranate 🍷",
      desc: "The semi-arid plains of Solapur provide the ideal dry stress needed for pomegranate trees to push sugars and vital polyphenols into their deep ruby seed arils.",
      farmerImg: "👨‍🌾",
      farmerName: "Vitthal Shinde",
      farmerRole: "Arid Soil Conservator",
      farmerQuote: "\"Pomegranates love dry heat. We use sugarcane mulch layers around tree bases to conserve 70% of groundwater.\"",
      organicCert: "USDA Organic",
      waterSystem: "Root Drip Systems",
      carbonOffset: 95,
      carbonOffsetDash: "10", // 201 * (1 - 0.95) ≈ 10
      carbonDesc: "Drought-resistant crops and biodynamic carbon sequestration methods neutralise the farm's entire energy footprint.",
      ctaText: "Next: Uji Matcha 🍵",
      ctaTarget: "uji",
      viewBox: [510, 265, 260, 156]
    },
    uji: {
      title: "Uji Hills, Kyoto, Japan",
      badge: "Ceremonial Uji Matcha 🍵",
      desc: "Nestled along the Uji River, the early morning mists and rolling shade structures provide the perfect microclimate for slow-grown, high-L-Theanine green tea leaves.",
      farmerImg: "👴",
      farmerName: "Hiroshi Tanaka",
      farmerRole: "Tea Master (Chashi)",
      farmerQuote: "\"We shade the tea plants for 4 weeks before harvest, forcing leaves to flood with rich, sweet chlorophyll.\"",
      organicCert: "JAS Certified",
      waterSystem: "River Mist Feeding",
      carbonOffset: 85,
      carbonOffsetDash: "30", // 201 * (1 - 0.85) ≈ 30
      carbonDesc: "Stone-ground on water-powered mills. Ocean shipping offset through carbon credit re-forestation projects.",
      ctaText: "Next: Glacial Water 🏔️",
      ctaTarget: "himalaya",
      viewBox: [680, 100, 300, 180]
    }
  };

  // 3. Map DOM Elements
  const svgMap = document.getElementById('interactive-svg-map');
  const hotspots = document.querySelectorAll('.map-hotspot');
  const detailsCard = document.getElementById('source-details-card');

  const sourceBadge = document.getElementById('source-badge');
  const sourceTitle = document.getElementById('source-title');
  const sourceDescText = document.getElementById('source-desc-text');
  
  const farmerImg = document.getElementById('farmer-img');
  const farmerNameText = document.getElementById('farmer-name-text');
  const farmerRoleText = document.getElementById('farmer-role-text');
  const farmerQuoteText = document.getElementById('farmer-quote-text');

  const ecoCertVal = document.getElementById('eco-cert-val');
  const ecoWaterVal = document.getElementById('eco-water-val');

  const carbonRingFill = document.getElementById('carbon-ring-fill');
  const carbonOffsetNum = document.getElementById('carbon-offset-num');
  const carbonDescText = document.getElementById('carbon-desc-text');
  
  const sourceCtaBtn = document.getElementById('source-cta-btn');

  // 4. ViewBox Animation Logic (Smooth Lerp Pan & Zoom)
  let currentVB = [0, 0, 1000, 600]; // initial viewBox coordinates
  let targetVB = [0, 0, 1000, 600];  // target viewBox coordinates
  const lerpFactor = 0.06;

  const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

  const updateViewBox = () => {
    let needsUpdate = false;
    for (let i = 0; i < 4; i++) {
      const diff = targetVB[i] - currentVB[i];
      if (Math.abs(diff) > 0.05) {
        currentVB[i] = lerp(currentVB[i], targetVB[i], lerpFactor);
        needsUpdate = true;
      } else {
        currentVB[i] = targetVB[i];
      }
    }
    if (needsUpdate) {
      svgMap.setAttribute('viewBox', currentVB.map(Math.round).join(' '));
    }
    requestAnimationFrame(updateViewBox);
  };
  
  // Start the render loop
  requestAnimationFrame(updateViewBox);

  // 5. Stat Counter Animation Logic
  const animateCounter = (element, endValue, duration = 1000) => {
    let startTimestamp = null;
    const startValue = parseInt(element.innerText) || 0;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const val = Math.floor(progress * (endValue - startValue) + startValue);
      element.innerText = `${val}%`;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.innerText = `${endValue}%`;
      }
    };
    window.requestAnimationFrame(step);
  };

  // 6. Sourcing Line Highlight Logic
  const highlightRouteLine = (regionKey) => {
    // De-activate all route lines
    document.querySelectorAll('.sourcing-route').forEach(route => {
      route.classList.remove('active');
    });
    // Activate current
    const activeRoute = document.getElementById(`route-${regionKey}`);
    if (activeRoute) {
      activeRoute.classList.add('active');
    }
  };

  // 7. Update Region UI Function
  const updateRegionUI = (regionKey) => {
    const data = regionData[regionKey];
    if (!data) return;

    // Zoom viewbox target update
    targetVB = [...data.viewBox];

    // Highlight supply routes
    highlightRouteLine(regionKey);

    // Visual Transition card slide
    detailsCard.classList.add('pop-animation');

    setTimeout(() => {
      // Update Texts
      sourceBadge.innerText = data.badge;
      sourceTitle.innerText = data.title;
      sourceDescText.innerText = data.desc;

      farmerImg.innerText = data.farmerImg;
      farmerNameText.innerText = data.farmerName;
      farmerRoleText.innerText = data.farmerRole;
      farmerQuoteText.innerText = data.farmerQuote;

      ecoCertVal.innerText = data.organicCert;
      ecoWaterVal.innerText = data.waterSystem;

      // Update Carbon Circle Ring and Counter Animation
      carbonDescText.innerText = data.carbonDesc;
      carbonRingFill.style.strokeDashoffset = data.carbonOffsetDash;
      animateCounter(carbonOffsetNum, data.carbonOffset);

      // Update CTA
      sourceCtaBtn.innerText = data.ctaText;
      sourceCtaBtn.setAttribute('data-target', data.ctaTarget);

      // Reveal transition
      detailsCard.classList.remove('pop-animation');
      detailsCard.classList.add('pop-in');
      setTimeout(() => {
        detailsCard.classList.remove('pop-in');
      }, 500);

    }, 300);
  };

  // 8. Initialize Sourcing Region
  updateRegionUI('himalaya');

  // 9. Click Handler for Map Pins
  hotspots.forEach(hotspot => {
    hotspot.addEventListener('click', () => {
      // Remove active class from all
      hotspots.forEach(h => h.classList.remove('active'));
      
      // Add active to current
      hotspot.classList.add('active');

      const regionKey = hotspot.getAttribute('data-region');
      updateRegionUI(regionKey);
    });
  });

  // 10. Click Handler for details card CTA button (Cycles regions)
  if (sourceCtaBtn) {
    sourceCtaBtn.addEventListener('click', () => {
      const nextTarget = sourceCtaBtn.getAttribute('data-target');
      
      // Update pins highlight
      hotspots.forEach(h => {
        if (h.getAttribute('data-region') === nextTarget) {
          h.classList.add('active');
        } else {
          h.classList.remove('active');
        }
      });

      updateRegionUI(nextTarget);
    });
  }

  // 11. Manual Zoom Controls
  const handleManualZoom = (factor) => {
    const [x, y, w, h] = targetVB;
    
    // Scale viewport
    const newW = Math.max(120, Math.min(1000, w * factor));
    const newH = Math.max(72, Math.min(600, h * factor));
    
    // Recenter
    const newX = Math.max(0, Math.min(1000 - newW, x + (w - newW) / 2));
    const newY = Math.max(0, Math.min(600 - newH, y + (h - newH) / 2));
    
    targetVB = [newX, newY, newW, newH];
  };

  document.getElementById('map-zoom-in').addEventListener('click', () => handleManualZoom(0.8));
  document.getElementById('map-zoom-out').addEventListener('click', () => handleManualZoom(1.2));
  document.getElementById('map-zoom-reset').addEventListener('click', () => {
    // Reset viewbox to initial full scale
    targetVB = [0, 0, 1000, 600];
    
    // De-activate pins and active route lines
    hotspots.forEach(h => h.classList.remove('active'));
    document.querySelectorAll('.sourcing-route').forEach(route => {
      route.classList.remove('active');
    });
    
    // Set details card back to default himalaya
    updateRegionUI('himalaya');
    document.getElementById('pin-himalaya').classList.add('active');
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
