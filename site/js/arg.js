// =====================
// ARG Core Logic (arg.js)
// =====================

// Initialize login state and navbar
// Reset progress if user has never visited before
function initFirstVisit() {
  if (!localStorage.getItem('joe_has_visited')) {
    localStorage.clear(); // Clear everything including login
    localStorage.setItem('joe_has_visited', 'true');
    console.log("[ARG] First visit detected. LocalStorage reset.");
  }
}

// Detect if user left the site and came back — reset if so
function detectLeaveSite() {
  if (!sessionStorage.getItem('joe_session_active')) {
    if (localStorage.getItem('joe_logged_in') === 'true') {
      console.log("[ARG] Session expired, but login is active. Skipping reset.");
      sessionStorage.setItem('joe_session_active', 'true');
      return;
    }

    console.log("[ARG] Session expired. Resetting progress.");
    localStorage.clear();
    localStorage.setItem('joe_has_visited', 'true'); // Prevent loop
  }

  sessionStorage.setItem('joe_session_active', 'true');

  window.addEventListener('beforeunload', () => {
    sessionStorage.removeItem('joe_session_active');
  });
}


function isLoginPage() {
  return window.location.pathname.includes("login.html");
}


// Run all checks on load
window.onload = () => {
  if (!isLoginPage()) {
    initFirstVisit();
    detectLeaveSite();
    checkLogin();
  }
};

function checkLogin() {
  const isLoggedIn = localStorage.getItem('joe_logged_in') === 'true';
  const navList = document.querySelector('.navbar-nav');
  if (!navList) return;

  const loginItem = navList.querySelector('a[href$="login.html"]');
  const existingLogout = navList.querySelector('#logout-link');

  if (isLoggedIn) {
    // Change "Login" to "Dashboard"
    if (loginItem) {
      const isOnIndex = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";
    
      loginItem.textContent = 'Dashboard';
      loginItem.setAttribute('href', isOnIndex ? './pages/dashboard.html' : 'dashboard.html');
    }
    

    // Add "Logout" if not already there
    if (!existingLogout) {
      const logoutLi = document.createElement('li');
      logoutLi.className = 'nav-item';

      const logoutLink = document.createElement('a');
      logoutLink.className = 'nav-link text-danger';
      logoutLink.href = '#';
      logoutLink.id = 'logout-link';
      logoutLink.textContent = 'Logout';

      logoutLink.addEventListener('click', () => {
        localStorage.removeItem('joe_logged_in');
        localStorage.removeItem('joe_has_visited');
        localStorage.removeItem('joe_progress');
        sessionStorage.removeItem('joe_session_active');

        const currentPath = window.location.pathname;
        if (currentPath.includes("dashboard")) {
          window.location.href = "../index.html";
        } else {
          window.location.reload();
        }
      });

      logoutLi.appendChild(logoutLink);
      navList.appendChild(logoutLi);
    }
  }
}

 
  // Check which page the player is on
  function checkCurrentPage() {
    const path = window.location.pathname;
  
    if (path.endsWith("index.html") || path === "/" || path === "/index") {
      const progress = getProgress();
      const isLoggedIn = localStorage.getItem('joe_logged_in') === 'true';
  
      // Only run ARG corruption if player is Joe OR puzzle is complete
      if (isLoggedIn || progress.puzzlesCompleted.indexPuzzle) {
        runIndexPuzzleSetup();
      }
    }
  
    // ... add more pages as needed
  }
  
  
  
  // ==========================
  // ARG Progression System
  // ==========================
  
  function initProgression() {
    if (!localStorage.getItem('joe_progress')) {
      const defaultProgress = {
        puzzlesCompleted: {
          aboutPagePuzzle: false,
          catalogPuzzle: false,
          indexPuzzle: false,
          dashboardPuzzle: false
        },
        boosterPacks: [],
        corruptedCards: []
      };
      localStorage.setItem('joe_progress', JSON.stringify(defaultProgress));
    }
  }
  
  function getProgress() {
    return JSON.parse(localStorage.getItem('joe_progress'));
  }
  
  function saveProgress(progress) {
    localStorage.setItem('joe_progress', JSON.stringify(progress));
  }
  
  function markPuzzleComplete(puzzleKey) {
    const progress = getProgress();
    if (!progress.puzzlesCompleted[puzzleKey]) {
      progress.puzzlesCompleted[puzzleKey] = true;
      const rewardNumber = Object.values(progress.puzzlesCompleted).filter(p => p).length;
      progress.boosterPacks.push(`Booster #00${rewardNumber}`);
      saveProgress(progress);
    }
  }
  
  function addCorruptedCard(cardCode) {
    const progress = getProgress();
    if (!progress.corruptedCards.includes(cardCode)) {
      progress.corruptedCards.push(cardCode);
      saveProgress(progress);
    }
  }
  
  function isPuzzleComplete(puzzleKey) {
    return getProgress().puzzlesCompleted[puzzleKey];
  }
  
  function getUnlockedBoosters() {
    return getProgress().boosterPacks;
  }
  
  function getCorruptedCards() {
    return getProgress().corruptedCards;
  }

// ==========================
// INDEX.html
// ==========================

// 🔼 KONAMI CODE PUZZLE
const konamiSequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
  if (e.key === konamiSequence[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiSequence.length) {
      konamiSuccess();
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});

function konamiSuccess() {
  // Only trigger once
  const puzzleKey = "indexPuzzle";
  if (isPuzzleComplete(puzzleKey)) return;

  markPuzzleComplete(puzzleKey);

  // Show modal
  const konamiModal = new bootstrap.Modal(document.getElementById('konamiModal'));
  konamiModal.show();
}

function runIndexPuzzleSetup() {
    // Set the background to dark mode
    document.body.classList.add("bg-dark");
    document.body.classList.add("text-light");

    const section = document.querySelector(".section-title");
    if (section) section.textContent = "F̷̟̓e̶̺͐a̸͉̚t̴͚̓u̸̩͊r̵̛͔ḛ̴͂d̶͚͊ ̶͚͐C̷͇̕a̷̲͊t̶̙̕ẻ̶̜g̴̺͝ơ̷͙r̶̯̄i̶͚̐e̸̝̊s̸̬̎";
  
    const cards = document.querySelectorAll(".card");
    if (!cards || cards.length < 3) return;
  
    // Card 1 - Corrupted Magic
    cards[0].querySelector("img").src = "https://media.tenor.com/GY5ihAZWNWEAAAAM/ojos.gif";
    cards[0].querySelector("h5").innerHTML = "M̵̖̚à̴̜g̴̡͝i̴̜͝c̴͈͐";
    cards[0].querySelector("p").innerHTML = "T̬͞h̡͔e͉͢ ́g̨͕a͝m͈e̡͠ ̨̮w͢i̡̯l̴͔l̵ ̨̻k̛̺n̤͠o̵̘ẁ͓.̢͚";
  
    // Card 2 - Corrupted Pokémon
    cards[1].querySelector("img").src = "https://media.istockphoto.com/id/1299163187/photo/ghostly-figure-praying-in-the-dark.jpg?s=612x612&w=0&k=20&c=HtWg5_zCULK0Ar--OjIw55_KIDE3JAjYFKnKQ9upNFI=";
    cards[1].querySelector("h5").innerHTML = "P̸̠̊o̷̠̚k̶̤̏é̷͍̓m̵̘͗ơ̷͓n̵̻͒";
    cards[1].querySelector("p").innerHTML = "T̬́h̠͝e̹͘y̸̝̰'͇͡ŕ͕e̡̺ ̷̖̘a̗͝l̢̖r̶͎e̛̗a̴͕d̞͞y̛͔ ͏̟h͙͢e̥͘r͠ͅe͘.̛";
  
    // Card 3 - Link to game.html
    const thirdCard = cards[2].closest(".card");
    const gameLink = document.createElement("a");
    gameLink.href = "./pages/marble-labyrinth.html";
    gameLink.className = "text-decoration-none";
    thirdCard.parentNode.replaceChild(gameLink, thirdCard);
    gameLink.appendChild(thirdCard);
  
    cards[2].querySelector("img").src = "https://img.freepik.com/premium-photo/dark-spooky-maze-with-unexpected-frights-around-corners_1314467-158517.jpg";
    cards[2].querySelector("h5").innerHTML = "E̶̪͋N̴͗ͅT̷̯͒Ḛ̵̚R̶̞̉";
    cards[2].querySelector("p").innerHTML = "S̻͟ò̢m̺̀e̚͢ ̴̯g̷̹a̡͕t͏͍e̼͡s͈͝ ̴̜m̡͡u̷̯s̤͡t͔͝ ͙͞b̖͜e̡͇ ̨̗w̛̳a̵͖l̷̥k̴͕e̡͢d̷͕.̷̨.̸.̶";
  }

// ==========================
// BINDER VIEW (Dashboard)
// ==========================

const corruptedCardImages = {
  "The Dealer": "../images/corrupted_cards/dealer_01.png",
  "Cold Pull": "../images/corrupted_cards/coldPull_02.png",
  "Cult of E Initiation": "../images/corrupted_cards/invite_03.png",
  "Shuffle the Self": "../images/corrupted_cards/shuffle_04.png",
  "The Mulligan Curse": "../images/corrupted_cards/mulligan_05.png",
  "Deck of the Damned": "../images/corrupted_cards/damned_06.png",
  "Side Deck Ritual": "../images/corrupted_cards/sideDeck_07.png",
  "Game Loss (Unexplained)": "../images/corrupted_cards/loss_08.png",
  "Decklist of Flesh": "../images/corrupted_cards/flesh_09.png",
  "Draw Phase (Endless)": "../images/corrupted_cards/draw_10.png",
  "Exodia, the Forbidden Truth": "../images/corrupted_cards/exodia_11.png",
  "Dealer’s Choice": "../images/corrupted_cards/choice_12.png",
  "The Empty Sleeve": "../images/corrupted_cards/sleeve_13.png"
};

const placeholderImage = "../images/placeholder.png";
let currentBinderPage = 0;
const cardsPerPage = 6;

function renderBinderPage() {
  const allCards = Object.keys(corruptedCardImages);
  const collected = getCorruptedCards();
  const grid = document.getElementById("card-binder-grid");
  if (!grid) return;

  grid.innerHTML = "";

  const start = currentBinderPage * cardsPerPage;
  const pageCards = allCards.slice(start, start + cardsPerPage);

  pageCards.forEach(name => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-2 text-center";

    const img = document.createElement("img");
    img.src = collected.includes(name) ? corruptedCardImages[name] : placeholderImage;
    img.alt = name;
    img.className = "img-fluid rounded mb-2";

    const label = document.createElement("div");
    label.textContent = collected.includes(name) ? name : "???";
    label.className = "text-muted small";

    col.appendChild(img);
    col.appendChild(label);
    grid.appendChild(col);
  });

  document.getElementById("binder-prev").disabled = currentBinderPage === 0;
  document.getElementById("binder-next").disabled = start + cardsPerPage >= allCards.length;
}

document.addEventListener("DOMContentLoaded", () => {
  const binderPrev = document.getElementById("binder-prev");
  const binderNext = document.getElementById("binder-next");

  if (binderPrev && binderNext) {
    binderPrev.addEventListener("click", () => {
      currentBinderPage--;
      renderBinderPage();
    });
    binderNext.addEventListener("click", () => {
      currentBinderPage++;
      renderBinderPage();
    });
  }
});



// ==========================
// DASHBOARD.html
// ==========================
console.log("%cHint: Try using ASCII values.", "color: #999; font-style: italic;");

function setupInventoryPuzzle() {
  const puzzleKey = "dashboardPuzzle";
  if (isPuzzleComplete(puzzleKey)) {
    document.getElementById("inventory-answer").placeholder = "Booster already unlocked.";
    return;
  }
}

function submitInventoryPuzzle() {
  const input = document.getElementById("inventory-answer").value.trim().toUpperCase();
  const puzzleKey = "dashboardPuzzle";

  if (input === "FEAR") {
    markPuzzleComplete(puzzleKey);
    alert("✅ Booster unlocked. The cards shimmer slightly...");
    document.getElementById("inventory-answer").placeholder = "Code accepted.";
    document.getElementById("inventory-answer").value = "";
  } else {
    alert("❌ Invalid query string. Try again.");
  }
}


  
  
  // ==========================
  // INIT on page load
  // ==========================

function resetProgress() {
    const resetState = {
      puzzlesCompleted: {
        aboutPagePuzzle: false,
        catalogPuzzle: false,
        indexPuzzle: false,
        dashboardPuzzle: false
      },
      boosterPacks: [],
      corruptedCards: []
    };
    localStorage.setItem('joe_progress', JSON.stringify(resetState));
    console.log("🔄 Progress reset. All puzzles are now unsolved.");
}
  
document.addEventListener("DOMContentLoaded", () => {
    initProgression();  // already part of your system
    checkLogin();
    checkCurrentPage();
});
  
  