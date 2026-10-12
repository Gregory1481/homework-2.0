document.addEventListener("DOMContentLoaded", () => {
  // --- ТРЕБОВАНИЕ 1: СКРЫТИЕ ОКНА НАД ХЭДЕРОМ ---
  const topBar = document.getElementById("top-bar");
  const topBarCloseBtn = document.getElementById("top-bar-close");

  if (topBar && topBarCloseBtn) {
    topBarCloseBtn.addEventListener("click", () => {
      topBar.classList.add("top-bar--hidden");
    });
  }

  const burgerToggle = document.getElementById("burger-toggle");
  const menu = document.getElementById("header__menu");
  const menuClose = document.getElementById("menu-close");

  if (burgerToggle && menu) {
    burgerToggle.addEventListener("click", () => {
      menu.classList.add("header__menu--open");
    });
  }

  if (menuClose && menu) {
    menuClose.addEventListener("click", () => {
      menu.classList.remove("header__menu--open");
    });
  }
});
