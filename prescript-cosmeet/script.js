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

  // --- Fallback prescripts (works even without network / offline) ---
  const DEFAULT_PRESCRIPTS = [
    {
      id: "PR-0104",
      tube: "N9201",
      message: "Visit [Artist Name]'s booth and tell them a tale of how the ocean looks beautiful. Depart immediately without waiting for their response."
    },
    {
      id: "PR-0219",
      tube: "N9201",
      message: "Locate an attendee carrying a badge or wearing red ribbons. Present them with a polite high-five and proclaim: 'The Will of the Prescript has been acknowledged.'"
    },
    {
      id: "PR-0342",
      tube: "S3014",
      message: "Find a cosplayer representing the City. Bow respectfully at a 45-degree angle, hand them a small wrapped candy, and say: 'The Weaver sends their regards.'"
    }
  ];

  let prescriptPool = [];
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

  // --- Load Prescripts from JSON ---
  async function loadPrescripts() {
    try {
      const response = await fetch("prescripts.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        prescriptPool = data.map(normalizePrescript);
      } else {
        prescriptPool = DEFAULT_PRESCRIPTS;
      }
    } catch (err) {
      console.warn("Could not load prescripts.json, using fallback data:", err);
      prescriptPool = DEFAULT_PRESCRIPTS;
    }
    resetQueue();
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

  // Initialize
  loadPrescripts();
});
