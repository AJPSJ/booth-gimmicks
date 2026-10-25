/**
 * THE WILL OF THE PRESCRIPT
 * Designed for static GitHub Pages hosting & convention tablet usage.
 * Lightweight, zero-dependency, lag-free transitions.
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const screenDeliver = document.getElementById("screen-deliver");
  const screenTube = document.getElementById("screen-tube");
  const screenSealed = document.getElementById("screen-sealed");
  const screenRevealed = document.getElementById("screen-revealed");

  const btnDeliver = document.getElementById("btn-deliver");
  const sealedStubTarget = document.getElementById("sealed-stub-target");
  const returnWeaverContainer = document.getElementById("weaver-return-container");
  const btnReturnWeaver = document.getElementById("btn-return-weaver");

  const tubeNameDisplay = document.getElementById("tube-name-display");
  const sealedTubeTag = document.getElementById("sealed-tube-tag");
  const revealedMessage = document.getElementById("revealed-message");

  // --- Embedded Prescript Dataset ---
  // Matches prescripts.json directly so the kiosk functions seamlessly on tablet
  // both online via GitHub Pages and offline via local file:/// protocol without CORS issues.
  const DEFAULT_PRESCRIPTS = [
    {
      id: "PR-0101",
      tube: "N9201",
      message: "Approach Table FG05. Gently place a small folded paper star or sticker on the counter, execute a solemn 45-degree bow without speaking, and walk away in a straight line."
    },
    {
      id: "PR-0102",
      tube: "S3014",
      message: "Stand before Table FG05. Silently observe Reishichi's artwork for seven seconds, give a single firm nod of approval, and step backward three paces before turning."
    },
    {
      id: "PR-0103",
      tube: "N9201",
      message: "Visit Table FG05. Silently hand Reishichi a small wrapped candy, touch your right hand to your heart, and depart immediately."
    },
    {
      id: "PR-0201",
      tube: "W4012",
      message: "Walk to Table FH02. Silently place an unblemished sticky note on the edge of the table, render a crisp two-finger salute to Cosmic Office, and walk away."
    },
    {
      id: "PR-0202",
      tube: "N9201",
      message: "Locate Table FH02. Point gently at Cosmic Office's display banner, offer a silent, knowing nod, and depart toward the left aisle."
    },
    {
      id: "PR-0203",
      tube: "E8812",
      message: "Visit Table FH02. Present Cosmic Office with a neatly folded paper airplane in complete silence, take two deliberate steps backward, and exit."
    },
    {
      id: "PR-0204",
      tube: "S3014",
      message: "Approach Bliss at Table FH02. Silently frame their artwork using your hands, offer a thumbs-up, and move to the adjacent row."
    },
    {
      id: "PR-0205",
      tube: "E8812",
      message: "Find Bliss at Table FH02. Silently place a shiny paperclip or small trinket on the counter, offer a deep bow of respect, and depart without speaking."
    },
    {
      id: "PR-0206",
      tube: "W4012",
      message: "Stand two meters from Bliss at Table FH02. Hold your hands behind your back, nod solemnly three times, and walk away."
    },
    {
      id: "PR-0301",
      tube: "N9201",
      message: "Navigate to Table FI07. Place a single unused bookmark silently on the counter, give Camyaminka a polite bow, and depart."
    },
    {
      id: "PR-0302",
      tube: "W4012",
      message: "Approach Table FI07. Point silently to one piece of art, place your palm over your chest, offer a brief nod to Camyaminka, and walk away."
    },
    {
      id: "PR-0303",
      tube: "S3014",
      message: "Visit Table FI07. Silently offer a small paper crane to Camyaminka, bow deeply, and vanish into the aisle."
    },
    {
      id: "PR-0401",
      tube: "N9201",
      message: "Stand three paces from a Dante or clockhead cosplayer. Silently tap your wrist five times, bow solemnly, and walk away."
    },
    {
      id: "PR-0402",
      tube: "S3014",
      message: "Approach a Trailblazer cosplayer. Silently offer them a clean piece of folded foil or a shiny token, give a firm nod, and walk away."
    },
    {
      id: "PR-0403",
      tube: "E8812",
      message: "Locate a cosplayer in Limbus Company or Index attire. Perform a crisp 45-degree bow in complete silence, step backward twice, and turn away."
    },
    {
      id: "PR-0404",
      tube: "N9201",
      message: "Approach a Genshin Impact Archon cosplayer. Silently present them with a shiny coin on an open palm, bow respectfully, and exit the area."
    },
    {
      id: "PR-0405",
      tube: "W4012",
      message: "Stand two meters from a cosplayer carrying a large prop weapon. Hold a silent, motionless salute for three seconds, then turn 180 degrees and leave."
    },
    {
      id: "PR-0406",
      tube: "E8812",
      message: "Walk past a Stellaron Hunter or Fatui cosplayer. Stop briefly, give them a subtle two-finger salute without making eye contact, and keep moving."
    },
    {
      id: "PR-0407",
      tube: "S3014",
      message: "Locate a Don Quixote cosplayer. Place your right fist over your heart in a silent knightly salute, bow slightly, and step backward."
    },
    {
      id: "PR-0408",
      tube: "W4012",
      message: "Approach a Zenless Zone Zero cosplayer or Bangboo plush. Silently present a thumbs-up, bow briefly, and move along."
    },
    {
      id: "PR-0409",
      tube: "N9201",
      message: "Find an attendee with badge ribbons. Offer a silent high-five, nod once, and continue on your route."
    },
    {
      id: "PR-0410",
      tube: "S3014",
      message: "Stand at the center of a major hallway intersection for ten seconds with your hands behind your back. Turn 90 degrees to your left and walk away silently."
    }
  ];

  let prescriptPool = [...DEFAULT_PRESCRIPTS];
  let availableQueue = [];
  let activeTimer = null;
  let currentPrescript = null;

  // --- Helper: Normalize prescript fields (flexible keys) ---
  function normalizePrescript(item, index) {
    const id = item.id || item["Prescript ID"] || item.prescript_id || `PR-${String(index + 1).padStart(4, "0")}`;
    const tube = item.tube || item["Tube Names"] || item.tube_name || "N9201";
    const message = item.message || item["Message"] || item.prescript || item.content || "The Prescript remains unwritten.";

    return { id, tube, message };
  }

  // --- Queue / Non-repeating Shuffle ---
  function resetQueue() {
    availableQueue = [...prescriptPool].sort(() => Math.random() - 0.5);
  }

  function getNextPrescript() {
    if (availableQueue.length === 0) {
      resetQueue();
    }
    return availableQueue.pop() || DEFAULT_PRESCRIPTS[0];
  }

  // --- Load Prescripts dynamically from JSON ---
  async function loadPrescripts() {
    try {
      // Timestamp query bypasses browser and GitHub Pages static caching
      const response = await fetch(`prescripts.json?_t=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        prescriptPool = data.map(normalizePrescript);
        resetQueue();
      }
    } catch (err) {
      // On local file:// (no HTTP server) or offline tablet, falls back to embedded DEFAULT_PRESCRIPTS
      console.info("Using embedded prescripts dataset (running offline or via file:// protocol).");
      prescriptPool = DEFAULT_PRESCRIPTS.map(normalizePrescript);
      resetQueue();
    }
  }

  // --- Screen State Switching ---
  function switchScreen(activeScreen) {
    [screenDeliver, screenTube, screenSealed, screenRevealed].forEach(screen => {
      if (screen === activeScreen) {
        screen.classList.remove("hidden");
        // Force reflow for silky smooth CSS transition
        void screen.offsetWidth;
        screen.classList.add("active");
      } else {
        screen.classList.remove("active");
        screen.classList.add("hidden");
      }
    });
  }

  // --- STEP 1 -> STEP 2: Deliver pressed ---
  btnDeliver.addEventListener("click", () => {
    currentPrescript = getNextPrescript();

    // Format tube name
    const formattedTube = currentPrescript.tube.startsWith("TUBE") 
      ? currentPrescript.tube 
      : `TUBE ${currentPrescript.tube}`;

    // Populate tube name displays
    if (tubeNameDisplay) {
      tubeNameDisplay.textContent = formattedTube;
    }
    if (sealedTubeTag) {
      sealedTubeTag.textContent = formattedTube;
    }

    // Set message for the revealed stub (message only)
    if (revealedMessage) {
      revealedMessage.textContent = currentPrescript.message;
    }

    // Transition to STEP 2: Tube arrival display
    switchScreen(screenTube);

    // After brief pneumatic arrival animation (1.6s), advance to STEP 3
    if (activeTimer) clearTimeout(activeTimer);
    activeTimer = setTimeout(() => {
      switchScreen(screenSealed);
    }, 1600);
  });

  // --- STEP 3 -> STEP 4: Sealed Stub tapped ---
  function openStub() {
    if (!screenSealed.classList.contains("active")) return;

    // Reset CTA state: Strictly hidden and non-interactive
    returnWeaverContainer.classList.remove("visible-cta");
    returnWeaverContainer.classList.add("hidden-cta");

    // Ensure message is updated
    if (currentPrescript && revealedMessage) {
      revealedMessage.textContent = currentPrescript.message;
    }

    // Transition to STEP 4: Revealed Prescript Message Stub
    switchScreen(screenRevealed);

    // STEP 5: Strictly after 7 seconds, fade in "Return to Weaver" CTA
    if (activeTimer) clearTimeout(activeTimer);
    activeTimer = setTimeout(() => {
      returnWeaverContainer.classList.remove("hidden-cta");
      returnWeaverContainer.classList.add("visible-cta");
    }, 7000);
  }

  sealedStubTarget.addEventListener("click", openStub);
  sealedStubTarget.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openStub();
    }
  });

  // --- STEP 5 -> STEP 1: Return to Weaver pressed ---
  btnReturnWeaver.addEventListener("click", () => {
    if (activeTimer) clearTimeout(activeTimer);
    
    // Hide CTA and smoothly return to initial Deliver screen
    returnWeaverContainer.classList.remove("visible-cta");
    returnWeaverContainer.classList.add("hidden-cta");
    switchScreen(screenDeliver);
  });

  // Initialize queue immediately, then attempt dynamic fetch
  resetQueue();
  loadPrescripts();
});
