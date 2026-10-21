/* ====================================================================
   GETHEN MAP — SCRIPT
   Only loaded on travel.html (see the <script> tag at the bottom of
   that file). Builds the clickable pins on the map from the PINS list
   below, and runs the info card, zoom/pan, and Edit Mode.

   This file is completely separate from script.js (which just runs
   the mobile menu on every page) so nothing here can break any other
   page on the site.
   ==================================================================== */


/* ====================================================================
   PINS LIST — EDIT THIS TO ADD, REMOVE, OR CHANGE MARKERS
   Nothing else in this file needs to change when you edit this list.

   - name / region / chapter  -> shown in the info card
   - type -> controls the pin's color and shape, and which legend
     entry it matches. Must be exactly one of:
       "city"       (ice-blue circle)
       "sacred"     (white diamond)
       "dangerous"  (orange circle with a "!")
       "landmark"   (blue-gray triangle)
   - x / y -> position in the map's own coordinate space (the SVG's
     viewBox is "0 0 900 991", drawn in travel.html). To find numbers
     for a NEW pin: scroll to the map, turn on "Edit Mode", and click
     the spot on the map you want — the x/y will show underneath it.
   - description / whyVisit / tip -> short text for the info card.
     These are draft text for you to fact-check and rewrite — a few
     entries say "[Verify chapter]" where the chapter wasn't given.
   ==================================================================== */
const PINS = [
  {
    name: "Erhenrang",
    region: "Karhide",
    type: "city",
    x: 434, y: 636,
    description: "NA",
    chapter: "Chapter 1"
  },
  {
    name: "The Fastness of Otherhord",
    region: "Karhide",
    type: "sacred",
    x: 619, y: 457,
    description: "NA",
    chapter: "Chapter 5"
  },
  {
    name: "Mishnory",
    region: "Orgoreyn",
    type: "city",
    x: 262, y: 576,
    description: " NA",
    chapter: "Chapter 10"
  },
  {
    name: "Pulefen Commensality Farm",
    region: "Orgoreyn",
    type: "dangerous",
    x: 197, y: 222,
    description: " NA",
    
    chapter: "[Verify chapter]"
  },
  {
    name: "The Gobrin Ice",
    region: "The Ice",
    type: "landmark",
    x: 274, y: 70,
    description: "NA",
    chapter: "Chapter 15"
  },
  {
    name: "Sinoth Valley",
    region: "Disputed Border",
    type: "landmark",
    x: 394, y: 298,
    description: "NA",
    chapter: "[Verify chapter]"
  },
  {
    name: "Rer",
    region: "Karhide",
    type: "city",
    x: 678, y: 622,
    description: "NA",
    chapter: "[Verify chapter]"
  }
];


/* ====================================================================
   SETUP — grabs the elements the rest of this file needs.
   ==================================================================== */
const SVG_NS = "http://www.w3.org/2000/svg";

const svg = document.getElementById("gethenMap");
const pinsGroup = document.getElementById("mapPins");
const mapWrap = document.getElementById("mapWrap");

const infoCard = document.getElementById("mapInfoCard");
const infoName = document.getElementById("mapInfoName");
const infoRegion = document.getElementById("mapInfoRegion");
const infoDescription = document.getElementById("mapInfoDescription");
const infoChapter = document.getElementById("mapInfoChapter");
const infoClose = document.getElementById("mapInfoClose");

const editToggle = document.getElementById("mapEditMode");
const editReadout = document.getElementById("mapEditReadout");

const zoomInBtn = document.getElementById("mapZoomIn");
const zoomOutBtn = document.getElementById("mapZoomOut");
const resetBtn = document.getElementById("mapReset");

// The map's "home" view, and what the Reset button returns to.
// Must match the viewBox written on the <svg> in travel.html.
const HOME_VIEW = { x: 0, y: 0, w: 900, h: 991 };
let view = Object.assign({}, HOME_VIEW);

function applyView() {
  svg.setAttribute("viewBox", view.x + " " + view.y + " " + view.w + " " + view.h);
}


/* ====================================================================
   BUILD PINS
   Reads the PINS list above and draws one marker per entry into the
   empty <g id="mapPins"> group in travel.html.
   ==================================================================== */
function buildPins() {
  PINS.forEach(function (pin) {
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("class", "map-pin map-pin-" + pin.type);
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", pin.name);

    // Invisible larger circle = the actual click/tap target.
    const hit = document.createElementNS(SVG_NS, "circle");
    hit.setAttribute("class", "map-pin-hit");
    hit.setAttribute("cx", pin.x);
    hit.setAttribute("cy", pin.y);
    g.appendChild(hit);

    // The visible marker shape: diamond for sacred places, triangle
    // for natural landmarks, circle for everything else (cities and
    // dangerous places — the "!" below is what sets dangerous apart).
    if (pin.type === "sacred") {
      const diamond = document.createElementNS(SVG_NS, "polygon");
      diamond.setAttribute("class", "map-pin-shape");
      diamond.setAttribute("points", [
        pin.x + "," + (pin.y - 10),
        (pin.x + 10) + "," + pin.y,
        pin.x + "," + (pin.y + 10),
        (pin.x - 10) + "," + pin.y
      ].join(" "));
      g.appendChild(diamond);
    } else if (pin.type === "landmark") {
      const tri = document.createElementNS(SVG_NS, "polygon");
      tri.setAttribute("class", "map-pin-shape");
      tri.setAttribute("points", [
        pin.x + "," + (pin.y - 10),
        (pin.x + 10) + "," + (pin.y + 8),
        (pin.x - 10) + "," + (pin.y + 8)
      ].join(" "));
      g.appendChild(tri);
    } else {
      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("class", "map-pin-shape");
      circle.setAttribute("cx", pin.x);
      circle.setAttribute("cy", pin.y);
      circle.setAttribute("r", 9);
      g.appendChild(circle);
    }

    // Small "!" drawn on top of dangerous pins only.
    if (pin.type === "dangerous") {
      const warn = document.createElementNS(SVG_NS, "text");
      warn.setAttribute("class", "map-pin-warning");
      warn.setAttribute("x", pin.x);
      warn.setAttribute("y", pin.y + 4);
      warn.textContent = "!";
      g.appendChild(warn);
    }

    // Native browser tooltip — simple built-in accessible fallback.
    const title = document.createElementNS(SVG_NS, "title");
    title.textContent = pin.name;
    g.appendChild(title);

    // Custom styled label that fades in on hover/focus (CSS does the
    // fade — see ".map-pin-label" in style.css).
    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("class", "map-pin-label");
    label.setAttribute("x", pin.x);
    label.setAttribute("y", pin.y - 16);
    label.textContent = pin.name;
    g.appendChild(label);

    g.addEventListener("click", function () {
      openInfoCard(pin);
    });
    g.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openInfoCard(pin);
      }
    });

    pinsGroup.appendChild(g);
  });
}


/* ====================================================================
   INFO CARD — shown when a pin is clicked.
   ==================================================================== */
function openInfoCard(pin) {
  infoName.textContent = pin.name;
  infoRegion.textContent = pin.region;
  infoDescription.textContent = pin.description;
  infoChapter.textContent = pin.chapter;
  infoCard.hidden = false;
}

function closeInfoCard() {
  infoCard.hidden = true;
}

infoClose.addEventListener("click", closeInfoCard);


/* ====================================================================
   ZOOM + PAN
   Both just change the SVG's viewBox — no extra libraries needed.
   ==================================================================== */
const ZOOM_STEP = 0.8;     // each zoom-in click shrinks the view by 20%
const MIN_ZOOM_W = 220;    // can't zoom in past this width

function zoomBy(factor) {
  const newW = Math.min(HOME_VIEW.w, Math.max(MIN_ZOOM_W, view.w * factor));
  const newH = newW * (HOME_VIEW.h / HOME_VIEW.w);

  // Keep the view centered on the same spot while the size changes.
  const cx = view.x + view.w / 2;
  const cy = view.y + view.h / 2;

  view.w = newW;
  view.h = newH;
  view.x = cx - newW / 2;
  view.y = cy - newH / 2;

  clampView();
  applyView();
}

// Keeps the view from panning so far it shows nothing but empty space.
function clampView() {
  view.x = Math.min(Math.max(view.x, HOME_VIEW.x - 50), HOME_VIEW.x + HOME_VIEW.w - view.w + 50);
  view.y = Math.min(Math.max(view.y, HOME_VIEW.y - 50), HOME_VIEW.y + HOME_VIEW.h - view.h + 50);
}

zoomInBtn.addEventListener("click", function () { zoomBy(ZOOM_STEP); });
zoomOutBtn.addEventListener("click", function () { zoomBy(1 / ZOOM_STEP); });
resetBtn.addEventListener("click", function () {
  view = Object.assign({}, HOME_VIEW);
  applyView();
});

// Dragging to pan (mouse and touch).
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let viewStart = { x: 0, y: 0 };

function startDrag(clientX, clientY) {
  isDragging = true;
  dragStart = { x: clientX, y: clientY };
  viewStart = { x: view.x, y: view.y };
  mapWrap.classList.add("map-wrap--dragging");
}

function moveDrag(clientX, clientY) {
  if (!isDragging) return;
  const scale = view.w / svg.getBoundingClientRect().width;
  view.x = viewStart.x - (clientX - dragStart.x) * scale;
  view.y = viewStart.y - (clientY - dragStart.y) * scale;
  clampView();
  applyView();
}

function endDrag() {
  isDragging = false;
  mapWrap.classList.remove("map-wrap--dragging");
}

svg.addEventListener("mousedown", function (e) { startDrag(e.clientX, e.clientY); });
window.addEventListener("mousemove", function (e) { moveDrag(e.clientX, e.clientY); });
window.addEventListener("mouseup", endDrag);

svg.addEventListener("touchstart", function (e) {
  const t = e.touches[0];
  startDrag(t.clientX, t.clientY);
}, { passive: true });
svg.addEventListener("touchmove", function (e) {
  const t = e.touches[0];
  moveDrag(t.clientX, t.clientY);
}, { passive: true });
svg.addEventListener("touchend", endDrag);


/* ====================================================================
   EDIT MODE
   Turn this on, then click anywhere on the map to read the x/y
   coordinates for that spot in the readout badge — copy those numbers
   into a new entry in the PINS list above.
   ==================================================================== */
function getMapPoint(clientX, clientY) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

svg.addEventListener("click", function (e) {
  if (!editToggle.checked) return;
  if (isDragging) return; // ignore the click that ends a drag
  const pt = getMapPoint(e.clientX, e.clientY);
  editReadout.hidden = false;
  editReadout.textContent = "x: " + Math.round(pt.x) + ",  y: " + Math.round(pt.y);
});

editToggle.addEventListener("change", function () {
  if (editToggle.checked) {
    editReadout.hidden = false;
    editReadout.textContent = "Click anywhere on the map to read its x / y coordinates.";
  } else {
    editReadout.hidden = true;
  }
});


/* ====================================================================
   INIT
   ==================================================================== */
buildPins();
applyView();
