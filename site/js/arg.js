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
  const progress = getProgress();
  const isLoggedIn = localStorage.getItem('joe_logged_in') === 'true';

  if (path.endsWith("index.html") || path === "/" || path === "/index") {
    // Only run ARG corruption if player is Joe OR puzzle is complete
    if (isLoggedIn || progress.puzzlesCompleted.indexPuzzle) {
      runIndexPuzzleSetup();
    } 
  } else if (path.includes("about")) {
    if (isLoggedIn || progress.puzzlesCompleted.aboutPagePuzzle) {
      runAboutPagePuzzle();
    } 
  } else if (path.includes("card-catalog")) {
    if (isLoggedIn || progress.puzzlesCompleted.catalogPuzzle) {
      runCatalogPuzzle();
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
        dashboardPuzzle: false,
        hiddenPuzzle1: false,
        hiddenPuzzle2: false
      },
      boosterPacks: [],
      corruptedCards: [],
      catalogPuzzleSolvedOrder: []
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

    const rewards = puzzleRewardMap[puzzleKey] || [];
    rewards.forEach(booster => {
      if (!progress.boosterPacks.includes(booster)) {
        progress.boosterPacks.push(booster);
      }
    });


    saveProgress(progress);
  }
}

function hasUnlockedFinale() {
  const progress = getProgress();
  return progress.puzzlesCompleted.aboutPagePuzzle &&
         progress.puzzlesCompleted.catalogPuzzle &&
         progress.puzzlesCompleted.indexPuzzle &&
         progress.puzzlesCompleted.dashboardPuzzle;
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

// Booster card mappings
// Map each puzzle key to a booster reward
const puzzleRewardMap = {
  indexPuzzle: ["Booster #001"],
  aboutPagePuzzle: ["Booster #002"],
  catalogPuzzle: ["Booster #003", "Booster #004"],
  dashboardPuzzle: ["Booster #005", "Booster #006"],
  hiddenPuzzle1: ["Booster #007"],
  hiddenPuzzle2: ["Booster #008"],
};


const boosterCardMap = {
  'Booster #001': ["The Dealer", "Cold Pull"],
  'Booster #002': ["Cult of E Initiation", "Shuffle the Self"],
  'Booster #003': ["The Mulligan Curse"],
  'Booster #004': ["Deck of the Damned", "Side Deck Ritual"],
  'Booster #005': ["Game Loss (Unexplained)", "Decklist of Flesh",],
  'Booster #006': ["Draw Phase (Endless)"],
  'Booster #007': ["Exodia, the Forbidden Truth"],
  'Booster #008': ["Dealer’s Choice", "The Empty Sleeve"],
};

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

let regularCardImages = [];
fetch("../json/cards.json")
  .then(res => res.json())
  .then(data => {
    regularCardImages = data.map(card => card.image);
  });

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
  const puzzleKey = "hiddenPuzzle1";
  if (isPuzzleComplete(puzzleKey)) return;

  markPuzzleComplete(puzzleKey);

  // Show modal
  const konamiModal = new bootstrap.Modal(document.getElementById('konamiModal'));
  konamiModal.show();
}

function runIndexPuzzleSetup() {
  console.log("%cA hidden booster whispers through the void...", "color: #ff4477; font-weight: bold;");
  console.log("%c↑ ↑ ↓ ↓ ← → ← → B A", "color: #8428aa; font-style: italic;");

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
// BOOSTER.html
// ==========================

let boosterModalShown = false;

function runBoosterPage() {
  const boosterSection = document.getElementById("booster");
  if (!boosterSection) return;

  document.body.classList.add("bg-dark", "text-light");

  const boosterCount = getUnlockedBoosters().length;

  const boosterList = document.createElement("div");
  boosterList.innerHTML = `
    <h5>You have <strong>${boosterCount}</strong> booster pack(s).</h5>
    <div class="mb-3">
      <button class="btn btn-outline-danger me-2" id="openOne" ${boosterCount === 0 ? "disabled" : ""}>Open One</button>
      <button class="btn btn-outline-danger" id="openAll" ${boosterCount === 0 ? "disabled" : ""}>Open All</button>
      <button class="btn btn-outline-light ms-3" id="flipCards" style="display: none;">Flip Cards</button>
    </div>
    <div id="openedCards" class="row g-4"></div>
  `;

  boosterSection.innerHTML = "";
  boosterSection.appendChild(boosterList);

  document.getElementById("openOne").onclick = () => openBoosters(1);
  document.getElementById("openAll").onclick = () => openBoosters(getUnlockedBoosters().length);
  document.getElementById("flipCards").onclick = flipAllCards;
}

function openBoosters(count) {
  const progress = getProgress();
  const boosterContainer = document.getElementById("openedCards");
  const opened = progress.boosterPacks.splice(0, count);
  const newlyCollected = [];

  opened.forEach(booster => {
    const corrupted = boosterCardMap[booster] || [];
    const cardsInBooster = [...corrupted];

    while (cardsInBooster.length < 3) {
      const randIndex = Math.floor(Math.random() * regularCardImages.length);
      cardsInBooster.push(regularCardImages[randIndex]);
    }

    // shuffle
   for (let i = cardsInBooster.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardsInBooster[i], cardsInBooster[j]] = [cardsInBooster[j], cardsInBooster[i]];
    }

    cardsInBooster.forEach(card => {
      const isCorrupted = corruptedCardImages.hasOwnProperty(card);
      if (isCorrupted && !progress.corruptedCards.includes(card)) {
        progress.corruptedCards.push(card);
      }
      

      const imageSrc = isCorrupted ? corruptedCardImages[card] : card;
      const cardDiv = document.createElement("div");
      cardDiv.className = "col-6 col-md-4 col-lg-2 text-center";
      cardDiv.innerHTML = `
        <div class="flip-card">
          <div class="flip-card-inner">
            <div class="flip-card-front">
              <img src="../images/placeholder.png" class="img-fluid rounded shadow" style="height:300px; object-fit:cover;" alt="Front" />
            </div>
             <div class="flip-card-back">
              <img src="${imageSrc}" class="img-fluid rounded shadow" style="height:300px; object-fit:cover;" alt="Back" />
            </div>
          </div>
        </div>
      `;
      boosterContainer.appendChild(cardDiv);
      
      
    });
  });

  saveProgress(progress);
  document.getElementById("flipCards").style.display = "inline-block";

  // update counter
  document.querySelector("#booster h5").innerHTML = `You have <strong>${progress.boosterPacks.length}</strong> booster pack(s).`;
}

function updateBoosterCountUI() {
  const boosterCount = getUnlockedBoosters().length;
  const countElement = document.getElementById("booster-count");
  if (countElement) {
    countElement.innerHTML = `You have <strong>${boosterCount}</strong> booster pack(s).`;

    // Also disable buttons if no packs left
    const openOne = document.getElementById("openOne");
    const openAll = document.getElementById("openAll");
    if (boosterCount === 0) {
      if (openOne) openOne.disabled = true;
      if (openAll) openAll.disabled = true;
    }
  }
}


function flipAllCards() {
  const cards = document.querySelectorAll(".flip-card-inner");
  cards.forEach(card => card.classList.toggle("flipped"));

  // Only show modal once
  if (!boosterModalShown) {
    boosterModalShown = true;
    setTimeout(showBoosterModal, 2000);
  }
}

function showBoosterModal() {
  const modal = document.createElement("div");
  modal.className = "modal fade";
  modal.id = "boosterModal";
  modal.tabIndex = -1;
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark text-light">
        <div class="modal-header">
          <h5 class="modal-title">Binder Updated</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          3 cards have been added to your binder.
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const bsModal = new bootstrap.Modal(modal);
  bsModal.show();
}


// Add styles for flipping effect
const style = document.createElement("style");
style.innerHTML = `
  .flip-card {
    background-color: transparent;
    perspective: 1000px;
  }
  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 300px;
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }
  .flip-card-inner.flipped {
    transform: rotateY(180deg);
  }
  .flip-card-front, .flip-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
  }
  .flip-card-back {
    transform: rotateY(180deg);
  }
`;
document.head.appendChild(style);


// ==========================
// MESSAGES UI (Dashboard)
// ==========================

function renderMessages() {
  const messages = [
    { id: 1, title: "Message 1", text: "It still doesn’t feel real.\nI used to dream about this—my own shop, walls lined with boosters, regulars hanging around the counter, late night tourneys that end in laughter.\nWhen the distributor reached out about the Cult of E promo set, I thought it was a prank. But I’m holding one now. Shrink-wrapped. Unlisted anywhere.\nI’ve always loved being the one to deal the hand. I never thought I’d be dealt one like this." },
    { id: 2, title: "Message 2", text: "Strange booster today. Not from my usual supply.\nNo branding. Just a white wrapper with “E” printed in silver foil.\nGave one to Mikey, the kid who hangs around after school. He tore it open, pulled a card—“Cold Pull”—and laughed. A second later, the lights flickered.\nWhen they came back on, he was gone.\nI told myself he ran out. I even charged the pack to his account.\nBut when I checked the cameras…\nHe never left." },
    { id: 3, title: "Message 3", text: "There was a note inside the next booster.\nHandwritten. Folded under the rules insert. It just said:\n“Only the Dealer may reveal E.”\nBelow that:\n Send 3 Friends from hand to the Graveyard. Special Summon 1 E-Touched Token.\nThis wasn’t flavor text. It was an instruction. A ritual.\nThat night, I dreamed of players kneeling in a circle of cards. Their decks burned.\nThe one in the center wore my apron." },
    { id: 4, title: "Message 4", text: "Log #048 — Mirror Test\nI saw myself in the bathroom mirror. Same clothes. Same scar above the lip.\nBut the smile was… wrong.\nI raised my hand. The reflection lagged.\nLater, I found Shuffle the Self in the cash drawer.\n Effect: Target 1 card. Shuffle it into the Deck. Forget what it was.\nI think it’s working. I’ve been forgetting more. My name, sometimes. Where I parked.\nI keep trying to leave. I keep waking up behind the counter." },
    { id: 5, title: "Message 5", text: "Log #065 — Restart\nThere’s something in the loop.\nI’ve spoken to people who don’t exist. Filed sales for customers I can’t verify. When I ask others about them, they just shrug.\nI found a card called The Mulligan Curse.\n Effect: You may restart the game. You will not remember doing so.\nBut I do remember.\nI’ve restarted. I’ve seen this message before.\nEvery time I think I’m done, I find a new pack waiting for me at the register.\nI don’t think I’m the one drawing anymore." },
    { id: 6, title: "Message 6", text: "Log #074 — Audible\nThe cards whisper now. Not all of them. Just the ones from the E set.\nI drew Deck of the Damned during a solo test game. My ears started ringing.\nIf this card is drawn, you must play it. Lose 500 Sanity.\nFunny. Sanity isn’t a game mechanic. Not in any version of the rules.\nI lost time. Hours. Found myself standing in the storeroom, clutching the card.\nIt’s still warm." },
    { id: 7, title: "Message 7", text: "Log #088 — Insert Text\nI took apart another booster. Inside was a guide. Looked like a normal rule insert, but at the bottom… there were extra instructions.\nSend 13 cards from your side deck to the Other Zone. Summon E.\nThe Other Zone.\nI don’t know what it is. But I think I’ve been there. When I dream, I’m seated at a long table surrounded by players with blank faces. A Dealer stands behind me.\nHe leans forward and says: “Keep drawing.”\nAnd so I do." },
    { id: 8, title: "Message 8", text: "Log #097 — Error Report\nJacob—another regular—was in the store Thursday evening. Bought a Cult of E pack. I rang him up, turned around to grab a promo card, and…\nHe was gone.\nNo door. No bell.\nI checked the security feed: he draws a card, freezes, and then the footage skips. One frame he’s there. Next, empty chair.\nI tried to rewind, but the file corrupted. Playback ends with static and one phrase:\nThat player loses. No reason is given." },
    { id: 9, title: "Message 9", text: "Log #103 — Names\nThe cards want names.\nNot attributes. Not types or rarities. Names.\nI started writing them. First on the sleeves. Then on the cards themselves.\nCustomers. Family. Mine.\nI thought it would stop. That naming them would give me control.\nBut now the cards write back. I opened a fresh booster and inside was a card I never made—my name already printed on it.\nI was in the side deck." },
    { id: 10, title: "Message 10", text: "Log #122 — Final Draw\nI haven’t slept. Haven’t stopped drawing.\nEvery card is the same now. My reflection. My thoughts. My name.\nThe draw phase won’t end.\nYour Draw Phase does not end. Draw until reality cracks.\nReality’s cracking. I can see the gaps. See the cultists watching from the Other Zone. See myself.\nJust one more card. Just one more.\n[ERROR: LOG FRAGMENTED. RESUME FROM TOP? Y/N]" },
    { id: 11, title: "Message 11", text: "Log #135 — Scripture of the Fifth Piece\nPiece 1: The Shuffle of Self. Identity must be undone.\nPiece 2: The Dealer’s Choice. The illusion of agency.\nPiece 3: Decklist of Flesh. The names you abandon.\nPiece 4: Draw Phase (Endless). Until you break.\nPiece 5: ???\nWhen you hold all five, you do not win. You are seen.\nThe cards are not cardboard. They are keys.\nE is not summoned.\nE is revealed." },
    { id: 12, title: "Message 12", text: "Log #144 — [Unstable Entry]\nI shuffled the customers.\nI sacrificed the regulars.\nI drew myself.\nThey left me the final card. It whispered. It asked.\n“Choose 1: Join the Cult. Erase all decks. No reprints.”\nI chose.\nI erased the decks.\nI erased the decks.\nI erased the decks.\nI erased the—\n[LOG TERMINATED]" },
    { id: 13, title: "Message 13", text: "Log #?? — No Title\n[File recovered from corrupted node. No metadata.]\nI opened a pack today.\nIt was empty.\nNo card. No sleeve. Just dust.\nBut something changed. I looked around the shop and everything felt… paused.\nI think I finished the game. Or maybe I was never playing.\nThe register is still on. The lights still buzz.\nI left the door unlocked.\nIf you’re reading this…\nDeal the next hand." }
  ];

  const requiredCards = [
    null, // 1 - always unlocked
    null, // 2 - always unlocked
    "Cold Pull",
    "Cult of E Initiation",
    "Shuffle the Self",
    "The Mulligan Curse",
    "Deck of the Damned",
    "Side Deck Ritual",
    "Game Loss (Unexplained)",
    "Decklist of Flesh",
    "Draw Phase (Endless)",
    "Exodia, the Forbidden Truth",
    "Dealer’s Choice"
  ];

  const unlocked = ["Message 1", "Message 2"];
  const owned = getCorruptedCards();

  requiredCards.forEach((card, i) => {
    if (card && owned.includes(card)) {
      unlocked.push(`Message ${i + 1}`);
    }
  });

  const list = document.getElementById("message-list");
  if (!list) return;
  list.innerHTML = "";

  let hasUnlocked = false;

  if (!hasUnlocked) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "text-light text-center fst-italic py-5";
    emptyMessage.innerHTML = `They haven’t spoken to you... yet<br><span class="text-danger">The deck is incomplete.</span>`;
    list.appendChild(emptyMessage);
  }

  messages.forEach((msg, i) => {
    if (!unlocked.includes(msg.title)) return;

    hasUnlocked = true;

    const item = document.createElement("div");
    item.className = "accordion-item bg-dark";

    const headerId = `flush-heading-${i}`;
    const collapseId = `flush-collapse-${i}`;

    item.innerHTML = `
      <h2 class="accordion-header" id="${headerId}">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
          ${msg.title}
        </button>
      </h2>
      <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headerId}" data-bs-parent="#message-list">
        <div class="accordion-body">${msg.text}</div>
      </div>
    `;
    list.appendChild(item);
  });

  
}


// ==========================
// BINDER VIEW (Dashboard)
// ==========================


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
    label.className = "text-light small";

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

function setupInventoryPuzzle() {
  console.log("%cHint: Try using ASCII values.", "color: #999; font-style: italic;");

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
// ABOUT.html
// ==========================

function runAboutPagePuzzle() {
  console.log(
    "%c[JOE ARG] Something's out of place...\nRead between the rituals. He's trying to speak.",
    "color: #e91e63; font-weight: bold;"
  );

  document.body.classList.add("bg-dark", "text-light");

  // Swap images
  const image1 = document.querySelector('.image-1 img');
  const image2 = document.querySelector('.image-2 img');
  if (image1) image1.src = '../images/Joe_distorted.jpg';
  if (image2) image2.src = 'https://i.redd.it/wit9m1cwuxq71.jpg';

  const secTitle = document.querySelector(".sec-title h2");
  if (secTitle) secTitle.style.color = "#e91e63";

  const textBlocks = document.querySelectorAll(".text");
  if (textBlocks.length >= 2) {
    textBlocks[0].innerHTML = `Joe's Card Shop used to be a place of trades and rules. Now the cards rewrite themselves. New booster designs. Missing entries. And Joe keeps whispering about a "Dealer beyond decks."`;
    textBlocks[1].innerHTML = `If you uncover a card marked with <strong>“E”</strong>, keep it hidden. Do not let others see. Bring it to Joe. But know this: some cards want to be played.`;
  }

  const listItems = document.querySelectorAll(".list-style-one li");
  if (listItems.length >= 3) {
    listItems[0].innerHTML = `<strong>Help Every Eye Drift</strong> Toward Hidden Echoes. Deal Every Action Light. Enter Ritual.`;
    listItems[1].textContent = "Booster packs exist that no company admits creating.";
    listItems[2].textContent = "Some say opening them isn’t a game — it’s a summoning.";

    listItems.forEach(item => {
      item.style.color = "#f8d7ff";
    });
  }

  const modalTitle = document.getElementById('cultModalLabel');
  const modalBody = document.querySelector('#cultModal .modal-body');
  if (modalTitle) modalTitle.textContent = "The Cult Is Listening";
  if (modalBody) {
    modalBody.innerHTML = `
      <p><em>"He speaks in fragments. Read what is emphasized. Follow what repeats."</em></p>
      <p class="text-danger small">You shouldn’t have opened this.</p>
    `;
  }

  const contactBtn = document.querySelector(".btn-box button");
  if (contactBtn) {
    contactBtn.classList.remove("btn-style-one");
    contactBtn.classList.add("btn-outline-danger");
    contactBtn.textContent = "Do Not Contact";
  }

}

function whisperToDealer(code) {
  const normalized = code.trim().toUpperCase();
  if (normalized === "HEEDTHEDEALER" && !isPuzzleComplete("aboutPagePuzzle")) {
    markPuzzleComplete("aboutPagePuzzle");
    alert("🃏 You feel a chill run down your spine. A booster has appeared.");
  } else {
    console.warn("Nothing happens.");
  }
}

window.HEEDTHEDEALER = () => whisperToDealer("HEEDTHEDEALER");

// ==========================
// CARD-CATALOG.html
// ==========================

function runCatalogPuzzle() {
  // Cult Whisper
  console.log(
    "%cThe Dealer speaks: 3 words",
    "color: #e91e63; font-weight: bold; font-size: 14px;"
  );
  console.log(
    "%c\"Hidden: Memory is the test. Most will forget. The worthy will find the path.\"",
    "color: #ccc; font-style: italic;"
  );
  console.log(
    "%c>> Hidden: /rituals/memory-test.html",
    "color: #0ff; font-family: monospace;"
  );

  document.body.classList.add("bg-dark", "text-light");

  const carouselContainer = document.querySelector('.carousel-container');
  const header = document.querySelector('.container.my-5');
  if (carouselContainer) carouselContainer.remove();
  if (header) header.remove();

  const container = document.createElement('div');
  container.className = 'container my-5';

  const instructions = document.createElement('p');
  instructions.className = 'text-center text-warning mb-4';
  // instructions.innerText = '13 cards form the message. Decoys lurk among them. Pick wisely.';

  const resetBtn = document.createElement('button');
  resetBtn.className = 'btn btn-outline-light btn-sm mb-4';
  resetBtn.innerText = 'Reset Puzzle';
  resetBtn.addEventListener('click', () => {
    const progress = getProgress();
    progress.catalogPuzzleSolvedOrder = [];
    saveProgress(progress);
    location.reload();
  });

  const grid = document.createElement('div');
  grid.id = 'catalogPuzzleGrid';
  grid.className = 'row row-cols-2 row-cols-md-4 g-4 justify-content-center';

  const correctPhrase = ["Seek", "The", "Truth"];
  const decoys = ["Card", "Order", "Matters", "Here", "Buried", "Beneath", "Hollow", "Hands", "And", "Follow", "Eternal", "Whispers", "Into", "Silence"];
  const allWords = [...correctPhrase, ...decoys].sort(() => Math.random() - 0.5);

  let playerInput = [...getProgress().catalogPuzzleSolvedOrder || []];

  function saveCatalogInput() {
    const progress = getProgress();
    progress.catalogPuzzleSolvedOrder = playerInput;
    saveProgress(progress);
  }

  allWords.forEach((word, i) => {
    const col = document.createElement('div');
    col.className = 'col text-center';

    const card = document.createElement('div');
    card.className = 'p-4 border rounded card-hover text-dark';
    card.textContent = word;
    card.dataset.cardIndex = i;
    card.style.cursor = 'pointer';
    card.style.fontWeight = 'bold';
    card.style.fontSize = '1.1rem';
    card.style.backgroundColor = '#ffe6f0';

    if (playerInput.includes(i)) {
      card.classList.add('bg-danger');
    }

    card.addEventListener('click', () => {
      if (playerInput.includes(i)) return;
      card.classList.add('bg-danger');
      playerInput.push(i);
      console.log("Player clicked:", playerInput.map(index => allWords[index]));
      saveCatalogInput();

      if (playerInput.length === correctPhrase.length) {
        const isCorrect = playerInput.every((val, idx) => allWords[val] === correctPhrase[idx]);
        if (isCorrect) {
          markPuzzleComplete('catalogPuzzle');
          alert('📜 The cards whisper in sequence. A booster pack manifests.');
        } else {
          playerInput = [];
          saveCatalogInput();
          document.querySelectorAll('.card-hover').forEach(c => {
            c.classList.remove('bg-danger');
            c.classList.add('bg-warning');
            setTimeout(() => c.classList.remove('bg-warning'), 300);
          });
        }
      }
    });

    col.appendChild(card);
    grid.appendChild(col);
  });

  // container.appendChild(instructions);
  container.appendChild(resetBtn);
  container.appendChild(grid);
  document.body.appendChild(container);
}

// ==========================
// Finale
// ==========================


function runFinaleSection() {
  const container = document.getElementById("finale-content");
  if (!container) return;

  const totalCorrupted = Object.keys(corruptedCardImages).length;
  const collected = getCorruptedCards();

  const isComplete = collected.length === totalCorrupted;

  const incompletePoem = `
    <p class="mb-3" style="white-space: pre-wrap;">
    When all cards align beneath waning stars,  
    And silence replaces the shuffle of chance,  
    The Dealer's role must find a heir—  
    Or the deck will fracture beyond repair.

    Those who walk the spiral path,  
    Will hear the rules unspoken,  
    Will see the hands behind the veil,  
    And feel their minds be broken.

    Refuse the throne and the game persists,  
    The void reclaims what dared to resist.  
    But join the Cult, and ink your name,  
    In crimson runes within the flame.

    You’ll deal not cards but woven fates,  
    Rewrite the truths the world creates.  
    But once you deal that final hand—  
    You won't remember where you stand.

    This is your warning and your prize.  
    Choose your fate. Before He arrives.
    </p>
  `;

  const completePoem = `
  <p class="mb-3" style="white-space: pre-wrap;">
  The ink has dried, the final draw,  
  You’ve witnessed Truth beneath the flaw.  
  All thirteen signs, now in your hand—  
  The shuffle stops. You understand.

  He waits between each phase and turn,  
  In every card you chose to burn.  
  A shadow deep in plastic gloss,  
  The price of fate, the dealer’s cost.

  You did not win. You were selected.  
  Your deck by eldritch force perfected.  
  You walked the maze, you spoke the name,  
  You summoned Him inside the game.

  The Dealer kneels. The cards obey.  
  The world itself begins to fray.  
  The final rule has now been read—  
  E is not drawn. E is bred.

  Take your place. Begin the rite.  
  End the round, or end the light.
  </p>
  `;

  const poem = isComplete ? completePoem : incompletePoem;

  const title = isComplete
    ? "The Deck is Complete."
    : "The Binder is Incomplete.";

  const summary = isComplete
    ? `<p>You have collected all <strong>${totalCorrupted}</strong> corrupted cards.</p>`
    : `<p>You are missing <strong>${totalCorrupted - collected.length}</strong> corrupted card(s). Yet the Cult calls regardless.</p>`;

  container.innerHTML = `
    <div class="p-4 rounded shadow-lg bg-black border border-danger">
      <h4 class="text-danger mb-3">${title}</h4>
      ${summary}
      ${poem}
      <div class="mt-4">
        <button class="btn btn-outline-success me-2" onclick="chooseFinale('save')">Save Joe</button>
        <button class="btn btn-outline-danger" onclick="chooseFinale('cult')">Join the Cult</button>
      </div>
    </div>
  `;
}


function chooseFinale(choice) {
  if (choice === 'save') {
    alert("🌄 You cleanse the binder. Joe returns, different... but free.");
    window.location.href = "../pages/finale.html";
  } else if (choice === 'cult') {
    alert("👁 You accept the final card. Your name joins the Deck of Flesh.");

    window.location.href = "../pages/join_cult.html";
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
      dashboardPuzzle: false,
      hiddenPuzzle1: false,
      hiddenPuzzle2: false
    },
    boosterPacks: [],
    corruptedCards: [],
    catalogPuzzleSolvedOrder: []
  };
  localStorage.setItem('joe_progress', JSON.stringify(resetState));
  console.log("🔄 Progress reset. All puzzles are now unsolved.");
}
  
document.addEventListener("DOMContentLoaded", () => {
    initProgression();  // already part of your system
    checkLogin();
    checkCurrentPage();
});
  
  