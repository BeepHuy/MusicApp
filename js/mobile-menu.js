// ═══════════════════════════════════════════
// mobile-menu.js — Sidebar Toggle for Mobile
// ═══════════════════════════════════════════

(() => {
  const menuToggle = document.querySelector(".menu-toggle");
  const sidebar = document.querySelector(".menu_side");
  const overlay = document.querySelector(".sidebar-overlay");

  if (!menuToggle || !sidebar || !overlay) return;

  function openMenu() {
    sidebar.classList.add("open");
    overlay.classList.add("active");
    menuToggle.innerHTML = '<i class="bi bi-x-lg"></i>';
    menuToggle.style.left = "240px";
  }

  function closeMenu() {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
    menuToggle.innerHTML = '<i class="bi bi-list"></i>';
    menuToggle.style.left = "";
  }

  menuToggle.addEventListener("click", () => {
    if (sidebar.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener("click", closeMenu);

  // Đóng sidebar khi click vào bài hát (trên mobile)
  sidebar.addEventListener("click", (e) => {
    if (e.target.closest(".songItem")) {
      if (window.innerWidth <= 768) {
        closeMenu();
      }
    }
  });

  // Đóng sidebar khi resize về desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
})();
