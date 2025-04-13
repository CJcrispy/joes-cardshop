// Show Joe's credentials in the console (ARG-style)
console.log("// TODO: Hide the test account login. joe_test: dealerpass");
  
function attemptLogin() {
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;

  if (user === 'joe_test' && pass === 'dealerpass') {
    localStorage.setItem('joe_logged_in', 'true');
    // document.getElementById('login-screen').style.display = 'none';
    startARG();
  } else {
    alert("Access Denied.");
  }
}

function checkLogin() {
  if (localStorage.getItem('joe_logged_in') === 'true') {
    // document.getElementById('login-screen').style.display = 'none';
  } 
}

function startARG() {
  console.log("%c[ARG Triggered] Welcome back, Joe.", "color: red; font-size: 16px;");
  window.location.href = "dashboard.html";
  // Additional ARG logic can go here.
  // e.g., unlock new elements, spawn puzzles, etc.
}

// Initial check on page load
window.onload = checkLogin;