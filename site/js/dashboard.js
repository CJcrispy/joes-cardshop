function switchSection(id) {
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  
    document.querySelectorAll('.sidebar a, #dashboardMenu a').forEach(link => link.classList.remove('active'));
    event?.currentTarget?.classList?.add('active');
  
    // 🔁 Load binder grid when user switches to binder
    if (id === "binder" && typeof renderBinderPage === "function") {
      renderBinderPage();
    }
    if (id === 'messages') renderMessages();
    if (id === 'booster') runBoosterPage();
  }
  

  function swapNavbarLink() {
    const loginLink = document.querySelector('a.nav-link[href="login.html"]');
    if (loginLink) {
      loginLink.textContent = 'Dashboard';
      loginLink.href = 'dashboard.html';
    }
  }

  function checkLogin() {
    if (localStorage.getItem('joe_logged_in') === 'true') {
      swapNavbarLink();
      // Optional: Hide login screen if needed
      // document.getElementById('login-screen').style.display = 'none';
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    checkLogin();
  });