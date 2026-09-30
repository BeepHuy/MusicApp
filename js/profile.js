// ═══════════════════════════════════════════
// profile.js — Profile Page
// Avatar/tên hiển thị + thông tin tài khoản + đổi mật khẩu
// ═══════════════════════════════════════════

const Profile = (() => {
  // ══════════════════════════
  // TOAST — thông báo nhỏ, thay cho alert()
  // ══════════════════════════
  function _toast(message, isError = false) {
    document.querySelector('.app-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'app-toast' + (isError ? ' app-toast-error' : '');
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ══════════════════════════
  // RENDER
  // ══════════════════════════
  function render() {
    const body = document.querySelector('.profile-body');
    if (!body) return;

    const user = Auth.getUser();
    if (!user) {
      body.innerHTML = `
        <div class="profile-empty">
          <i class="bi bi-person-circle"></i>
          <p>Sign in to view your profile</p>
          <button class="profile-signin-btn">Sign In</button>
        </div>
      `;
      body.querySelector('.profile-signin-btn')?.addEventListener('click', () => {
        document.querySelector('.user-login-btn')?.click();
      });
      return;
    }

    const meta = user.user_metadata || {};
    const name = meta.full_name || meta.name || user.email?.split('@')[0] || 'User';
    const avatar = meta.avatar_url || meta.picture || 'img/user.png';
    const isAdmin = user.id === ADMIN_UID;
    const provider = user.app_metadata?.provider || 'email';
    const isEmailProvider = provider === 'email';
    const providerLabel = provider === 'google' ? 'Google' : 'Email';
    const joined = user.created_at ? new Date(user.created_at).toLocaleDateString() : '—';

    body.innerHTML = `
      <div class="profile-card">
        <div class="profile-identity">
          <div class="profile-avatar-wrap" id="profileAvatarWrap">
            <img src="${avatar}" alt="${name}" referrerpolicy="no-referrer" id="profileAvatarImg">
            <div class="profile-avatar-overlay"><i class="bi bi-camera-fill"></i></div>
            <input type="file" accept="image/*" id="profileAvatarInput" style="display:none">
          </div>
          <div class="profile-identity-info">
            <div class="profile-name" id="profileName" title="Click to edit">
              ${name} <i class="bi bi-pencil-fill"></i>
            </div>
            <div class="profile-email">${user.email || ''}</div>
            <div class="profile-badges">
              <span class="profile-badge"><i class="bi ${provider === 'google' ? 'bi-google' : 'bi-envelope-fill'}"></i> ${providerLabel}</span>
              ${isAdmin ? '<span class="profile-badge profile-badge-admin"><i class="bi bi-shield-fill-check"></i> Admin</span>' : ''}
            </div>
          </div>
        </div>
      </div>

      <div class="profile-card">
        <h3>Account info</h3>
        <div class="profile-info-row"><span>Email</span><span>${user.email || '—'}</span></div>
        <div class="profile-info-row"><span>Member since</span><span>${joined}</span></div>
        <div class="profile-info-row"><span>Sign-in method</span><span>${providerLabel}</span></div>
      </div>

      <div class="profile-card">
        <h3>Password</h3>
        ${isEmailProvider ? `
          <form id="profilePasswordForm">
            <div class="profile-form-row">
              <label>New password</label>
              <input type="password" class="profile-input" id="profileNewPassword" minlength="6" required>
            </div>
            <div class="profile-form-row">
              <label>Confirm new password</label>
              <input type="password" class="profile-input" id="profileConfirmPassword" minlength="6" required>
            </div>
            <button type="submit" class="profile-submit-btn" id="profilePasswordBtn">Update password</button>
          </form>
        ` : `<p class="profile-provider-note">Mật khẩu do ${providerLabel} quản lý, không thể đổi tại đây.</p>`}
      </div>
    `;

    _bindAvatar(body);
    _bindNameEdit(body, name);
    if (isEmailProvider) _bindPasswordForm(body);
  }

  // ══════════════════════════
  // AVATAR UPLOAD
  // ══════════════════════════
  function _bindAvatar(body) {
    const wrap = body.querySelector('#profileAvatarWrap');
    const input = body.querySelector('#profileAvatarInput');
    const img = body.querySelector('#profileAvatarImg');
    if (!wrap || !input || !img) return;

    wrap.addEventListener('click', () => input.click());

    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      input.value = '';
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        _toast('Please choose an image file', true);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        _toast('Image must be 2MB or smaller', true);
        return;
      }

      const user = Auth.getUser();
      if (!user) return;

      wrap.classList.add('uploading');
      try {
        const ext = (file.name.match(/\.[^.]+$/) || ['.jpg'])[0];
        const path = `${user.id}/avatar${ext}`;

        const { error: uploadError } = await db.storage
          .from('avatars')
          .upload(path, file, { upsert: true });
        if (uploadError) throw uploadError;

        const { data } = db.storage.from('avatars').getPublicUrl(path);
        const avatarUrl = `${data.publicUrl}?t=${Date.now()}`;

        const { error: updateError } = await db.auth.updateUser({ data: { avatar_url: avatarUrl } });
        if (updateError) throw updateError;

        img.src = avatarUrl;
        _toast('Avatar updated!');
      } catch (err) {
        console.error('Avatar upload failed:', err);
        _toast(err.message || 'Failed to update avatar', true);
      } finally {
        wrap.classList.remove('uploading');
      }
    });
  }

  // ══════════════════════════
  // DISPLAY NAME (inline edit)
  // ══════════════════════════
  function _bindNameEdit(body, currentName) {
    const nameEl = body.querySelector('#profileName');
    if (!nameEl) return;

    nameEl.addEventListener('click', function onEditClick() {
      nameEl.removeEventListener('click', onEditClick);
      nameEl.innerHTML = `<input type="text" class="profile-name-input" maxlength="60" value="${currentName.replace(/"/g, '&quot;')}">`;
      const input = nameEl.querySelector('input');
      input.focus();
      input.select();

      let done = false;
      const submit = async () => {
        if (done) return;
        done = true;
        const newName = input.value.trim();
        if (newName && newName !== currentName) {
          const { error } = await db.auth.updateUser({ data: { full_name: newName } });
          if (error) {
            _toast(error.message || 'Failed to update name', true);
          } else {
            _toast('Name updated!');
          }
        }
        render();
      };

      input.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') submit();
        if (e.key === 'Escape') { done = true; render(); }
      });
      input.addEventListener('blur', submit);
    });
  }

  // ══════════════════════════
  // CHANGE PASSWORD
  // ══════════════════════════
  function _bindPasswordForm(body) {
    const form = body.querySelector('#profilePasswordForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPassword = body.querySelector('#profileNewPassword').value;
      const confirmPassword = body.querySelector('#profileConfirmPassword').value;
      const btn = body.querySelector('#profilePasswordBtn');

      if (newPassword.length < 6) {
        _toast('Password must be at least 6 characters', true);
        return;
      }
      if (newPassword !== confirmPassword) {
        _toast('Passwords do not match', true);
        return;
      }

      btn.disabled = true;
      try {
        const { error } = await db.auth.updateUser({ password: newPassword });
        if (error) throw error;
        _toast('Password updated!');
        form.reset();
      } catch (err) {
        _toast(err.message || 'Failed to update password', true);
      } finally {
        btn.disabled = false;
      }
    });
  }

  return { render };
})();
