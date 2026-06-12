// auth.js — Authentication Module (Supabase)
// Email + Google OAuth, session management

const Auth = (() => {
  let currentUser = null;

  // INIT — check existing session
  async function init() {
    // Listen for auth state changes
    db.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        currentUser = session.user;
        _renderLoggedIn();
      } else {
        currentUser = null;
        _renderLoggedOut();
      }
    });

    // Check current session
    const { data: { session } } = await db.auth.getSession();
    if (session?.user) {
      currentUser = session.user;
      _renderLoggedIn();
    } else {
      _renderLoggedOut();
    }

    _createModal();
    _bindEvents();
  }

  // CREATE MODAL HTML
  function _createModal() {
    const modal = document.createElement('div');
    modal.className = 'auth-overlay';
    modal.id = 'authModal';
    modal.innerHTML = `
      <div class="auth-modal">
        <button class="auth-close" id="authClose"><i class="bi bi-x-lg"></i></button>
        <h2 id="authTitle">Sign In</h2>
        <p class="auth-subtitle" id="authSubtitle">Welcome back to Music App</p>

        <button class="auth-google" id="googleLogin">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google">
          Continue with Google
        </button>

        <div class="auth-divider"><span>or</span></div>

        <form id="authForm">
          <input class="auth-input" type="text" id="authName" placeholder="Your name" style="display:none">
          <input class="auth-input" type="email" id="authEmail" placeholder="Email" required>
          <input class="auth-input" type="password" id="authPassword" placeholder="Password" required>
          <button class="auth-submit" type="submit" id="authSubmitBtn">Sign In</button>
        </form>

        <div class="auth-error" id="authError"></div>

        <div class="auth-toggle">
          <span id="authToggleText">Don't have an account?</span>
          <a id="authToggleLink">Sign Up</a>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // BIND EVENTS
  function _bindEvents() {
    let isLoginMode = true;

    // Open modal
    document.addEventListener('click', (e) => {
      if (e.target.closest('#loginBtn') || e.target.closest('.user-login-btn')) {
        _openModal();
      }
    });

    // Close modal
    document.getElementById('authClose')?.addEventListener('click', _closeModal);
    document.getElementById('authModal')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) _closeModal();
    });

    // Toggle login/register
    document.getElementById('authToggleLink')?.addEventListener('click', () => {
      isLoginMode = !isLoginMode;
      _updateModalMode(isLoginMode);
    });

    // Form submit
    document.getElementById('authForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('authEmail').value;
      const password = document.getElementById('authPassword').value;
      const name = document.getElementById('authName').value;
      const btn = document.getElementById('authSubmitBtn');
      const errorEl = document.getElementById('authError');

      btn.disabled = true;
      errorEl.textContent = '';

      try {
        if (isLoginMode) {
          const { error } = await db.auth.signInWithPassword({ email, password });
          if (error) throw error;
        } else {
          const { error } = await db.auth.signUp({
            email,
            password,
            options: { data: { full_name: name || email.split('@')[0] } }
          });
          if (error) throw error;
          errorEl.style.color = '#5DCAA5';
          errorEl.textContent = 'Check your email to confirm!';
          btn.disabled = false;
          return;
        }
        _closeModal();
      } catch (err) {
        errorEl.style.color = '#f09595';
        errorEl.textContent = err.message;
      }
      btn.disabled = false;
    });

    // Google login
    document.getElementById('googleLogin')?.addEventListener('click', async () => {
      const { error } = await db.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + window.location.pathname }
      });
      if (error) {
        document.getElementById('authError').textContent = error.message;
      }
    });

    // User dropdown toggle
    document.addEventListener('click', (e) => {
      const dropdown = document.querySelector('.user-dropdown');
      if (!dropdown) return;

      if (e.target.closest('.user-menu')) {
        dropdown.classList.toggle('active');
      } else {
        dropdown.classList.remove('active');
      }
    });

    // Logout
    document.addEventListener('click', async (e) => {
      if (e.target.closest('.logout-btn')) {
        await db.auth.signOut();
      }
    });
  }

  // MODAL HELPERS
  function _openModal() {
    document.getElementById('authModal')?.classList.add('active');
    _updateModalMode(true);
  }

  function _closeModal() {
    document.getElementById('authModal')?.classList.remove('active');
    document.getElementById('authError').textContent = '';
    document.getElementById('authForm')?.reset();
  }

  function _updateModalMode(isLogin) {
    document.getElementById('authTitle').textContent = isLogin ? 'Sign In' : 'Sign Up';
    document.getElementById('authSubtitle').textContent = isLogin
      ? 'Welcome back to Music App'
      : 'Create your account';
    document.getElementById('authSubmitBtn').textContent = isLogin ? 'Sign In' : 'Sign Up';
    document.getElementById('authToggleText').textContent = isLogin
      ? "Don't have an account? "
      : 'Already have an account? ';
    document.getElementById('authToggleLink').textContent = isLogin ? 'Sign Up' : 'Sign In';
    document.getElementById('authName').style.display = isLogin ? 'none' : 'block';
  }

  // RENDER USER STATE
  function _renderLoggedIn() {
    const userContainers = document.querySelectorAll('.user');
    const meta = currentUser.user_metadata || {};
    const name = meta.full_name || meta.name || currentUser.email?.split('@')[0] || 'User';
    const avatar = meta.avatar_url || meta.picture || 'img/user.png';

    userContainers.forEach(container => {
      container.innerHTML = `
        <div class="user-menu">
          <img loading="lazy" src="${avatar}" alt="${name}" referrerpolicy="no-referrer">
          <span class="user-name">${name}</span>
          <div class="user-dropdown">
            <a href="#"><i class="bi bi-person"></i> Profile</a>
            <a href="#"><i class="bi bi-gear"></i> Settings</a>
            <a class="logout-btn"><i class="bi bi-box-arrow-right"></i> Log out</a>
          </div>
        </div>
      `;
    });
  }

  function _renderLoggedOut() {
    const userContainers = document.querySelectorAll('.user');
    userContainers.forEach(container => {
      container.innerHTML = `
        <button class="user-login-btn" style="
          background: linear-gradient(135deg, #36e2ec, #2bc4d0);
          border: none;
          color: #fff;
          border-radius: 20px;
          font-size: 12px;
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          transition: 0.3s;
        ">Sign In</button>
      `;
    });
  }

  function getUser() { return currentUser; }

  return { init, getUser };
})();