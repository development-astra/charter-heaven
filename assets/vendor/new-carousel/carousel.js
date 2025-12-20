(function () {
    const track = document.getElementById("yachtsTrack");
    const slides = Array.from(document.querySelectorAll(".yacht"));
    const indicatorsWrap = document.getElementById("carouselIndicators");
    const indicators = Array.from(document.querySelectorAll(".indicator"));
    
    if (!track || slides.length === 0 || !indicatorsWrap || indicators.length === 0) return;

    /* ============================
        Helpers
    ============================ */
    function getGap() {
        const styles = window.getComputedStyle(track);
        return parseFloat(styles.columnGap || styles.gap || "0") || 0;
    }

    function getStep() {
        const slideWidth = slides[0].getBoundingClientRect().width;
        return slideWidth + getGap();
    }

    function clamp(n, min, max) {
        return Math.max(min, Math.min(n, max));
    }

    function setActive(index) {
        indicators.forEach((btn, i) => btn.classList.toggle("is-active", i === index));
    }

    function getActiveIndex() {
        const idx = indicators.findIndex((b) => b.classList.contains("is-active"));
        return idx >= 0 ? idx : 0;
    }

    function goTo(index, behavior = "smooth") {
        const step = getStep();
        const safeIndex = clamp(index, 0, slides.length - 1);

        track.scrollTo({
        left: step * safeIndex,
        behavior
        });

        setActive(safeIndex);
    }

    /* ============================
        Indicator Click
    ============================ */
    indicators.forEach((btn, index) => {
        btn.addEventListener("click", () => goTo(index));
    });

    /* ============================
        Sync Indicators on Scroll
    ============================ */
    let ticking = false;

    track.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;

        window.requestAnimationFrame(() => {
        const step = getStep();
        const index = Math.round(track.scrollLeft / step);
        setActive(clamp(index, 0, slides.length - 1));
        ticking = false;
        });
    });

    /* ============================
        Resize: keep current slide aligned
    ============================ */
    window.addEventListener("resize", () => {
        goTo(getActiveIndex(), "auto");
    });

    /* ============================
        Drag / Swipe Support (Desktop)
    ============================ */
    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;

    function onDown(e) {
        // Only left click for mouse
        if (e.type === "mousedown" && e.button !== 0) return;

        isDown = true;
        track.classList.add("is-dragging");
        startX = e.pageX - track.offsetLeft;
        startScrollLeft = track.scrollLeft;
    }

    function onMove(e) {
        if (!isDown) return;
        e.preventDefault();

        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.4; // sensitivity
        track.scrollLeft = startScrollLeft - walk;
    }

    function onUp() {
        if (!isDown) return;
        isDown = false;
        track.classList.remove("is-dragging");

        // Snap to closest slide after drag
        const step = getStep();
        const index = Math.round(track.scrollLeft / step);
        goTo(index);
    }

    track.addEventListener("mousedown", onDown);
    track.addEventListener("mousemove", onMove);
    track.addEventListener("mouseup", onUp);
    track.addEventListener("mouseleave", onUp);

    // Prevent image drag ghosting
    track.querySelectorAll("img").forEach((img) => {
        img.addEventListener("dragstart", (e) => e.preventDefault());
    });

    /* ============================
        Init
    ============================ */
    // Ensure first indicator is active and alignment is correct
    setActive(0);
    goTo(0, "auto");
})();

/* ============================
   Image Viewer Icon (Top-Left)
   - Adds a small icon button on each yacht image
   - Clicking icon opens a lightbox viewer
   - Does NOT change existing carousel code/behavior
============================ */
(function initImageViewerIcon() {
  const imgs = Array.from(document.querySelectorAll(".yacht__image"));
  if (!imgs.length) return;

  // Inject CSS from JS (no need to edit main.css)
  const style = document.createElement("style");
  style.textContent = `
    .imgview-wrap{
      position: relative;
      display: block;
    }
    .imgview-btn{
        position: absolute;
        top: 12px;
        left: 12px;
        width: 40px;
        height: 40px;
        border-radius: 999px;
        border: 0;
        cursor: pointer;
        display: grid;
        place-items: center;
        background: transparent;
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);

        z-index: 3;
    }
    .imgview-btn svg{
      width: 18px;
      height: 18px;
      display: block;
    }

    /* keep icon a bit smaller on thumbs */
    .yacht__image--thumb + .imgview-btn{
      width: 34px;
      height: 34px;
      top: 10px;
      left: 10px;
    }
    .yacht__image--thumb + .imgview-btn svg{
      width: 16px;
      height: 16px;
    }

    .imgview-overlay{
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: rgba(0,0,0,.72);
      z-index: 9999;
    }
    .imgview-overlay.is-open{ display: flex; }
    .imgview-stage{
      position: relative;
      width: min(1200px, 96vw);
      height: min(780px, 88vh);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .imgview-stage img{
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 16px;
      
    }
    .imgview-close{
      position: absolute;
      top: -1px;
      right: -14px;
      width: 40px;
      height: 40px;
      border-radius: 999px;
      border: 0;
      cursor: pointer;
      background: rgba(255,255,255,.14);
      color: #fff;
      font-size: 22px;
      line-height: 40px;
    }
    /* Mobile adjustment */
@media (max-width: 768px){
  .imgview-close{
    top: 230px;
    right: -10px;
    width: 36px;
    height: 36px;
    font-size: 20px;
    line-height: 36px;
  }
}
  `;
  document.head.appendChild(style);

  // Build overlay once
  const overlay = document.createElement("div");
  overlay.className = "imgview-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  const stage = document.createElement("div");
  stage.className = "imgview-stage";

  const bigImg = document.createElement("img");
  bigImg.alt = "";

  const closeBtn = document.createElement("button");
  closeBtn.className = "imgview-close";
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.textContent = "×";

  stage.appendChild(bigImg);
  stage.appendChild(closeBtn);
  overlay.appendChild(stage);
  document.body.appendChild(overlay);

  function openViewer(src, alt) {
    bigImg.src = src;
    bigImg.alt = alt || "";
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeViewer() {
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    bigImg.src = "";
  }

  closeBtn.addEventListener("click", closeViewer);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeViewer();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) closeViewer();
  });

  // Create icon button (magnifier) + wrap each image
  imgs.forEach((img) => {
    // Prevent double-initializing
    if (img.closest(".imgview-wrap")) return;

    const wrap = document.createElement("span");
    wrap.className = "imgview-wrap";

    // Insert wrapper in place of the image
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);

    // Icon button
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "imgview-btn";
    btn.setAttribute("aria-label", "View image");

    // Simple magnifier SVG (no external files)
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="#1f2a44" d="M10 4a6 6 0 104.47 10.03l4.25 4.25a1 1 0 001.41-1.41l-4.25-4.25A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z"/>
      </svg>
    `;

    // Place button on top-left of image
    wrap.appendChild(btn);

    // Click icon -> open viewer
    btn.addEventListener("click", (e) => {
      // Don’t affect carousel drag/click behavior
      e.preventDefault();
      e.stopPropagation();
      openViewer(img.currentSrc || img.src, img.alt);
    });
  });
})();
