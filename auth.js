/* ==========================================================================
   NatureSip Frontend Authentication Module
   ========================================================================== */

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://naure-sip-premium.onrender.com/api';

// Prepopulate test user if database does not exist
const initDatabase = () => {
  if (!localStorage.getItem('registeredUsers')) {
    const defaultUsers = [
      {
        name: "Test User",
        email: "test@naturesip.com",
        password: "password123"
      }
    ];
    localStorage.setItem('registeredUsers', JSON.stringify(defaultUsers));
  }
};

// Toast Notification Utility
export const showToast = (message) => {
  let toast = document.getElementById('auth-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'auth-toast';
    toast.className = 'auth-toast';
    document.body.appendChild(toast);
  }
  toast.innerText = message;
  toast.classList.remove('hide');
  toast.classList.add('show');
  
  // Clean up after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('hide');
  }, 2500);
};

// HTML injection for Login Modal Container
const injectModalHTML = (modalContainer) => {
  modalContainer.innerHTML = `
    <div class="login-modal-container glass-card">
      <button id="login-modal-close-btn" class="modal-close-btn" aria-label="Close modal">&times;</button>
      
      <!-- SIGN IN VIEW -->
      <div id="login-view-signin" class="login-view-wrapper">
        <div class="login-header-section">
          <span class="logo-emoji">🌿</span>
          <h2 class="login-modal-title">Welcome Back</h2>
          <p class="login-modal-subtitle">Sign in to your NatureSip account</p>
        </div>
        
        <form id="signin-form" class="login-form-fields" novalidate>
          <div class="form-group">
            <label for="signin-email">Email Address</label>
            <input type="email" id="signin-email" placeholder="you@example.com" required autocomplete="email">
            <span class="error-msg" id="signin-email-error">Please enter a valid email address</span>
          </div>
          <div class="form-group">
            <label for="signin-password">Password</label>
            <input type="password" id="signin-password" placeholder="••••••••" required autocomplete="current-password">
            <span class="error-msg" id="signin-password-error">Password must be at least 6 characters</span>
          </div>
          
          <button type="submit" id="signin-submit-btn" class="btn btn-primary btn-block">
            <span class="btn-text">Sign In</span>
            <span class="btn-loader hide" id="signin-loader"></span>
          </button>
        </form>
        
        <div class="login-modal-footer">
          <p>Don't have an account? <a href="#" id="go-to-signup">Create one</a></p>
        </div>
      </div>

      <!-- SIGN UP VIEW -->
      <div id="login-view-signup" class="login-view-wrapper hide">
        <div class="login-header-section">
          <span class="logo-emoji">🌿</span>
          <h2 class="login-modal-title">Create Account</h2>
          <p class="login-modal-subtitle">Join the NatureSip premium club</p>
        </div>
        
        <form id="signup-form" class="login-form-fields" novalidate>
          <div class="form-group">
            <label for="signup-name">Full Name</label>
            <input type="text" id="signup-name" placeholder="John Doe" required autocomplete="name">
            <span class="error-msg" id="signup-name-error">Please enter your name</span>
          </div>
          <div class="form-group">
            <label for="signup-email">Email Address</label>
            <input type="email" id="signup-email" placeholder="you@example.com" required autocomplete="email">
            <span class="error-msg" id="signup-email-error">Please enter a valid email address</span>
          </div>
          <div class="form-group">
            <label for="signup-password">Password</label>
            <input type="password" id="signup-password" placeholder="••••••••" required autocomplete="new-password">
            <span class="error-msg" id="signup-password-error">Password must be at least 6 characters</span>
          </div>
          <div class="form-group">
            <label for="signup-confirm-password">Confirm Password</label>
            <input type="password" id="signup-confirm-password" placeholder="••••••••" required autocomplete="new-password">
            <span class="error-msg" id="signup-confirm-password-error">Passwords do not match</span>
          </div>
          
          <button type="submit" id="signup-submit-btn" class="btn btn-primary btn-block">
            <span class="btn-text">Create Account</span>
            <span class="btn-loader hide" id="signup-loader"></span>
          </button>
        </form>
        
        <div class="login-modal-footer">
          <p>Already have an account? <a href="#" id="go-to-signin">Sign In</a></p>
        </div>
      </div>
    </div>
  `;
};

// Render Auth buttons / triggers in navbar
const updateNavbarUI = () => {
  const desktopContainer = document.getElementById('desktop-auth-container');
  const mobileContainer = document.getElementById('mobile-auth-container');
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  if (currentUser) {
    // Desktop: Logged in State
    if (desktopContainer) {
      desktopContainer.innerHTML = `
        <div class="user-profile-wrapper" id="user-profile-wrapper" style="margin-right: 16px;">
          <button id="user-profile-trigger" class="user-profile-trigger">
            <span class="user-avatar">👤</span>
            <span class="user-name-text">${currentUser.name}</span>
            <span class="dropdown-chevron">▼</span>
          </button>
          <div id="profile-dropdown" class="profile-dropdown glass-card hide">
            <div class="dropdown-header">
              <span class="user-email-text">${currentUser.email}</span>
            </div>
            <hr class="dropdown-divider">
            <button onclick="window.location.href='dashboard.html'" class="dropdown-item">
              <span class="item-icon">📊</span> My Dashboard
            </button>
            <button id="logout-btn" class="dropdown-item">
              <span class="item-icon">🚪</span> Log Out
            </button>
          </div>
        </div>
      `;
    }

    // Mobile: Logged in State
    if (mobileContainer) {
      mobileContainer.innerHTML = `
        <div class="mobile-user-profile">
          <div class="mobile-profile-info">
            <span class="user-avatar">👤</span>
            <div class="mobile-user-details">
              <span class="mobile-user-name">${currentUser.name}</span>
              <span class="mobile-user-email">${currentUser.email}</span>
            </div>
          </div>
          <div class="mobile-profile-actions" style="display: flex; gap: 8px; width: 100%; margin-top: 10px;">
            <button onclick="window.location.href='dashboard.html'" class="btn btn-primary btn-sm" style="flex: 1;">Dashboard</button>
            <button id="mobile-logout-btn" class="btn btn-secondary btn-sm mobile-logout-btn" style="flex: 1;">Log Out</button>
          </div>
        </div>
      `;
    }

  } else {
    // Desktop: Logged out State
    if (desktopContainer) {
      desktopContainer.innerHTML = `
        <button id="nav-signin-btn" class="btn btn-secondary btn-sm" style="margin-right: 16px;">Sign In</button>
      `;
    }

    // Mobile: Logged out State
    if (mobileContainer) {
      mobileContainer.innerHTML = `
        <button id="mobile-signin-btn" class="btn btn-secondary btn-mobile-auth">Sign In</button>
      `;
    }
  }

  // Hook elements
  bindDynamicNavbarEvents();
  window.onAuthChange?.();
};

// Bind dynamic event listeners to navbar components
const bindDynamicNavbarEvents = () => {
  const signInBtn = document.getElementById('nav-signin-btn');
  const mobileSignInBtn = document.getElementById('mobile-signin-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
  const profileTrigger = document.getElementById('user-profile-trigger');
  const profileDropdown = document.getElementById('profile-dropdown');
  const profileWrapper = document.getElementById('user-profile-wrapper');
  
  const loginModal = document.getElementById('login-modal');

  const openModal = () => {
    if (loginModal) {
      // Clear forms
      document.getElementById('signin-form')?.reset();
      document.getElementById('signup-form')?.reset();
      clearFormErrors();
      
      // Toggle to Signin View by default
      document.getElementById('login-view-signin')?.classList.remove('hide');
      document.getElementById('login-view-signup')?.classList.add('hide');
      
      loginModal.classList.remove('hide');
      document.body.style.overflow = 'hidden';

      // Close mobile drawer if open
      const mobileToggle = document.getElementById('mobile-menu-btn');
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileToggle && mobileMenu) {
        mobileToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
      }
    }
  };

  // Click Sign In
  if (signInBtn) signInBtn.addEventListener('click', openModal);
  if (mobileSignInBtn) mobileSignInBtn.addEventListener('click', openModal);

  // Click Logout
  const performLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    updateNavbarUI();
    showToast("You have been logged out.");
  };

  if (logoutBtn) logoutBtn.addEventListener('click', performLogout);
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', performLogout);

  // Toggle Dropdown Menu
  if (profileTrigger && profileDropdown && profileWrapper) {
    profileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = profileDropdown.classList.toggle('hide');
      profileWrapper.classList.toggle('active', !isHidden);
    });
  }
};

// Clear form input error highlights
const clearFormErrors = () => {
  const inputs = document.querySelectorAll('#login-modal input');
  inputs.forEach(input => input.classList.remove('invalid'));
};

// Setup Modal event handlers
const setupModalControllers = () => {
  const loginModal = document.getElementById('login-modal');
  const modalCloseBtn = document.getElementById('login-modal-close-btn');
  const goToSignup = document.getElementById('go-to-signup');
  const goToSignin = document.getElementById('go-to-signin');

  const viewSignin = document.getElementById('login-view-signin');
  const viewSignup = document.getElementById('login-view-signup');

  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');

  const closeModal = () => {
    loginModal?.classList.add('hide');
    document.body.style.overflow = '';
  };

  // Close clicks
  modalCloseBtn?.addEventListener('click', closeModal);
  loginModal?.addEventListener('click', (e) => {
    if (e.target === loginModal) {
      closeModal();
    }
  });

  // Switch View clicks
  goToSignup?.addEventListener('click', (e) => {
    e.preventDefault();
    clearFormErrors();
    viewSignin?.classList.add('hide');
    viewSignup?.classList.remove('hide');
  });

  goToSignin?.addEventListener('click', (e) => {
    e.preventDefault();
    clearFormErrors();
    viewSignup?.classList.add('hide');
    viewSignin?.classList.remove('hide');
  });

  // Helper validation functions
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Sign In submit handler
  signinForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('signin-email');
    const passwordInput = document.getElementById('signin-password');
    const emailVal = emailInput.value.trim();
    const passwordVal = passwordInput.value.trim();

    let isValid = true;

    // Validate email
    if (!validateEmail(emailVal)) {
      emailInput.classList.add('invalid');
      isValid = false;
    } else {
      emailInput.classList.remove('invalid');
    }

    // Validate password
    if (passwordVal.length < 6) {
      passwordInput.classList.add('invalid');
      isValid = false;
    } else {
      passwordInput.classList.remove('invalid');
    }

    // Submit to login API endpoint
    const submitBtn = document.getElementById('signin-submit-btn');
    const loader = document.getElementById('signin-loader');
    const btnText = submitBtn.querySelector('.btn-text');

    submitBtn.disabled = true;
    loader.classList.remove('hide');
    btnText.innerText = "Signing in...";

    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailVal,
        password: passwordVal
      })
    })
    .then(res => res.json().then(data => ({ status: res.status, data })))
    .then(({ status, data }) => {
      if (status === 200 && data.status === 'success') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        closeModal();
        updateNavbarUI();
        showToast(`Welcome back, ${data.user.name}! 🌿`);
      } else {
        emailInput.classList.add('invalid');
        passwordInput.classList.add('invalid');
        showToast(data.message || "Invalid email address or password.");
      }
    })
    .catch(err => {
      console.error(err);
      showToast("Network error. Failed to connect to server.");
    })
    .finally(() => {
      submitBtn.disabled = false;
      loader.classList.add('hide');
      btnText.innerText = "Sign In";
    });
  });

  // Sign Up submit handler
  signupForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('signup-name');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const confirmPasswordInput = document.getElementById('signup-confirm-password');

    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    const passwordVal = passwordInput.value.trim();
    const confirmPasswordVal = confirmPasswordInput.value.trim();

    let isValid = true;

    // Name check
    if (nameVal === '') {
      nameInput.classList.add('invalid');
      isValid = false;
    } else {
      nameInput.classList.remove('invalid');
    }

    // Email check
    if (!validateEmail(emailVal)) {
      emailInput.classList.add('invalid');
      isValid = false;
    } else {
      emailInput.classList.remove('invalid');
    }

    // Password check
    if (passwordVal.length < 6) {
      passwordInput.classList.add('invalid');
      isValid = false;
    } else {
      passwordInput.classList.remove('invalid');
    }

    // Confirm Password check
    if (confirmPasswordVal !== passwordVal || confirmPasswordVal === '') {
      confirmPasswordInput.classList.add('invalid');
      isValid = false;
    } else {
      confirmPasswordInput.classList.remove('invalid');
    }

    // Submit to registration API endpoint
    const submitBtn = document.getElementById('signup-submit-btn');
    const loader = document.getElementById('signup-loader');
    const btnText = submitBtn.querySelector('.btn-text');

    submitBtn.disabled = true;
    loader.classList.remove('hide');
    btnText.innerText = "Creating account...";

    fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: nameVal,
        email: emailVal,
        password: passwordVal
      })
    })
    .then(res => res.json().then(data => ({ status: res.status, data })))
    .then(({ status, data }) => {
      if (status === 201 && data.status === 'success') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        closeModal();
        updateNavbarUI();
        showToast(`Account registered successfully! Welcome ${data.user.name} ✨`);
      } else {
        emailInput.classList.add('invalid');
        showToast(data.message || "An account with this email address already exists.");
      }
    })
    .catch(err => {
      console.error(err);
      showToast("Network error. Failed to connect to server.");
    })
    .finally(() => {
      submitBtn.disabled = false;
      loader.classList.add('hide');
      btnText.innerText = "Create Account";
    });
  });
};

// Global click click-outside listeners to close dropdowns
const setupGlobalDismissListeners = () => {
  document.addEventListener('click', (e) => {
    const profileDropdown = document.getElementById('profile-dropdown');
    const profileWrapper = document.getElementById('user-profile-wrapper');
    if (profileDropdown && !profileDropdown.classList.contains('hide')) {
      // Check if user clicked outside wrapper
      if (!profileWrapper.contains(e.target)) {
        profileDropdown.classList.add('hide');
        profileWrapper.classList.remove('active');
      }
    }
  });
};

// Core Init Trigger export
export const initAuth = () => {
  initDatabase();
  
  // Render login modal HTML structure
  const modalContainer = document.getElementById('login-modal');
  if (modalContainer) {
    injectModalHTML(modalContainer);
  }

  // Update navbar layout
  updateNavbarUI();

  // Set event listeners on modal
  setupModalControllers();

  // Global dismiss listener
  setupGlobalDismissListeners();
};
