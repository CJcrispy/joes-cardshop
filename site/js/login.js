console.log("// TODO: Hide the test account login. joe_test: dealerpass");

function attemptLogin(event) {
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;

  if (user === 'joe_test' && pass === 'dealerpass') {
    // Set session and local storage
    localStorage.setItem('joe_logged_in', 'true');
    sessionStorage.setItem('joe_session_active', 'true');

    // Show Welcome Modal using Bootstrap Modal
    const welcomeModal = new bootstrap.Modal(document.getElementById('welcomeModal'));
    welcomeModal.show();

    // Redirect to home page after 4 seconds
    setTimeout(function() {
      window.location.href = "../index.html"; // Redirect to home page after 4 seconds
    }, 4000);
  } else {
    // Show Access Denied Modal using Bootstrap Modal
    const accessDeniedModal = new bootstrap.Modal(document.getElementById('accessDeniedModal'));
    accessDeniedModal.show();
  }
}
