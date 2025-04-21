// ===== Scroll Reveal =====
const revealElements = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.1 }
);
revealElements.forEach((el) => observer.observe(el));
document.getElementById("enter-button").addEventListener("click", function () {
  document.getElementById("cover-page").style.opacity = "0";
  document.getElementById("cover-page").style.visibility = "hidden";

  // Optional: scroll smoothly to the intro section
  document.querySelector(".intro-section").scrollIntoView({ behavior: "smooth" });
});

// ===== Drag & Drop =====
const suitcase = document.getElementById("suitcase");
const shapes = document.querySelectorAll(".shape");

shapes.forEach((shape) => {
  shape.addEventListener("pointerdown", startDrag);
});

let activeShape = null;
let offsetX = 0;
let offsetY = 0;

function startDrag(e) {
  activeShape = e.target;
  offsetX = e.clientX - activeShape.offsetLeft;
  offsetY = e.clientY - activeShape.offsetTop;
  activeShape.setPointerCapture(e.pointerId);
  activeShape.style.cursor = "grabbing";

  activeShape.addEventListener("pointermove", onDrag);
  activeShape.addEventListener("pointerup", endDrag);
}

function onDrag(e) {
  if (!activeShape) return;
  activeShape.style.left = `${e.clientX - offsetX}px`;
  activeShape.style.top = `${e.clientY - offsetY}px`;
}

function endDrag() {
  if (!activeShape) return;
  const shapeRect = activeShape.getBoundingClientRect();
  const suitcaseRect = suitcase.getBoundingClientRect();

  if (isInside(shapeRect, suitcaseRect)) {
    const shapeName = activeShape.dataset.shape;
    const info = document.getElementById(`info-${shapeName}`);
    if (info) {
      info.style.display = "block";
    }
  }
  activeShape.style.cursor = "grab";
  activeShape.removeEventListener("pointermove", onDrag);
  activeShape.removeEventListener("pointerup", endDrag);
  activeShape = null;
}

function isInside(small, big) {
  return (
    small.left > big.left &&
    small.right < big.right &&
    small.top > big.top &&
    small.bottom < big.bottom
  );
}

//String
const svg = document.getElementById("stringSvg");

let points = [];
let mouseX = 0;
let mouseY = 0;
let amplitude = 60;
let spacing = 20;
let noiseSeed = Math.random() * 1000;
let noiseTime = 0;

// Perlin Noise function
function noise(y) {
  return Math.sin(y * 0.005 + noiseSeed) * 0.5 + 0.5;
}

function resizeSvg() {
  svg.setAttribute("height", document.body.scrollHeight);
  svg.setAttribute("width", window.innerWidth);
}

function generatePoints() {
  const container = document.getElementById("stringContainer");
  const height = document.body.scrollHeight;
  const width = container.clientWidth;
  const centerX = width / 2;

  points = [];
  for (let y = 0; y <= height; y += spacing) {
    const baseX = centerX + (noise(y * 0.01) - 0.5) * amplitude * 2;
    points.push({
      baseX,
      y,
      x: baseX,
      vx: 0,
      ax: 0,
    });
  }
}
function drawPath() {
  const startY = 900;

  let started = false;
  let d = "";
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p.y < startY) continue;

    if (!started) {
      d += `M ${p.x} ${p.y} `;
      started = true;
    } else {
      d += `L ${p.x} ${p.y} `;
    }
  }

  let path = document.querySelector("#stringPath");
  if (!path) {
    path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("id", "stringPath");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#ce270a");
    path.setAttribute("opacity", "0.6");
    path.setAttribute("stroke-width", "1.2");
    svg.appendChild(path);
  }
  path.setAttribute("d", d);
}

function animate() {
  noiseTime += 0.002;

  points.forEach((p) => {
    const noiseWiggle = (noise(p.y * 0.01 + noiseTime) - 0.5) * 5;
    const targetX = p.baseX + noiseWiggle;

    const dx = p.x - mouseX;
    const dy = p.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 150) {
      const force = (150 - dist) / 150;
      p.ax += (p.x - mouseX) * 0.01 * force;
    }

    const spring = (targetX - p.x) * 0.015;
    p.ax += spring;
    p.vx += p.ax;
    p.vx *= 0.88;
    p.x += p.vx;
    p.ax = 0;
  });

  drawPath();
  requestAnimationFrame(animate);
}

// Init
window.addEventListener("load", () => {
  resizeSvg();
  generatePoints();
  drawPath();
  animate();
});

window.addEventListener("mousemove", (e) => {
  mouseY = e.clientY + window.scrollY;
  mouseX = e.clientX;
});

window.addEventListener("resize", () => {
  resizeSvg();
  generatePoints();
  drawPath();
});

window.addEventListener("scroll", () => {
  drawPath();
});

// ===== Map (Load on Scroll) =====
let mapInitialized = false;
function initMap() {
  const map = L.map("map", {
    center: [35.8617, 104.1954],
    zoom: 4,
    minZoom: 4,
    maxZoom: 7,
    dragging: true,
    scrollWheelZoom: false,
    maxBounds: [
      [17.5, 73.5],
      [53.5, 135.0],
    ],
    maxBoundsViscosity: 1.0,
  });
  setTimeout(() => {
    map.invalidateSize();
  }, 500);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  const locations = [
    {
      lat: 28.1124,
      lng: 112.9838,
      title: "Hunan",
      img: "https://cdn.glitch.global/db7855d8-eb16-4e06-a21b-eb7ed04586cf/Clarissa--orphanage%20(Xinhua_)-1.jpeg?v=1745199867563",
      desc: "This is Clarissa and Rose's orphanage in Xinhua, a county within the province of Hunan.",
    },
    {
      lat: 23.379,
      lng: 113.7633,
      title: "Guangdon",
      img: "https://via.placeholder.com/100",
      desc: "This is Guangdon",
    },
  ];

  locations.forEach((location) => {
    const marker = L.marker([location.lat, location.lng]).addTo(map);
    const popupContent = `
      <div class="custom-popup">
        <h3>${location.title}</h3>
        <img src="${location.img}" alt="${location.title}">
        <p>${location.desc}</p>
      </div>
    `;
    marker.bindPopup(popupContent);
    marker.on("mouseover", () => marker.openPopup());
    marker.on("mouseout", () => marker.closePopup());
  });

  gsap.to("#map-container", {
    width: "100vw",
    height: "100vh",
    borderRadius: "0%",
    ease: "power2.out",
    scrollTrigger: {
      trigger: "#map-container",
      start: "top 85%",
      end: "top 20%",
      scrub: true,
      onUpdate: () => {
        map.invalidateSize();
      },
    },
  });
}

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.create({
  trigger: "#map-container",
  start: "top 90%",
  onEnter: () => {
    if (!mapInitialized) {
      initMap();
      mapInitialized = true;
    }
  },
});