// =====================
// ARG Core Logic (arg.js)
// =====================

// Initialize login state and navbar
function checkLogin() {
    if (localStorage.getItem('joe_logged_in') === 'true') {
      const navItems = document.querySelectorAll('.navbar-nav');
      navItems.forEach(nav => {
        const loginItem = nav.querySelector('a[href="login.html"]');
        if (loginItem) {
          loginItem.textContent = 'Dashboard';
          loginItem.setAttribute('href', 'dashboard.html');
        }
      });
    }
  }
  
  // Check which page the player is on
  function checkCurrentPage() {
    const path = window.location.pathname;
  
    if (path.endsWith("index.html") || path === "/" || path === "/index") {
      runIndexPuzzleSetup(); // call your index-specific changes here
    }
  
    // other page conditions here...
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
  
  