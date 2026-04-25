/* ============================================================
   script.js — Three.js hero + parallax + lazy blur-in reveals
   ============================================================ */

// ── NAV scroll effect ─────────────────────────────────────
const nav = document.getElementById('nav');
const burger = document.getElementById('nav-burger');
const navLinks = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

burger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Footer year ───────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ── THREE.JS HERO ─────────────────────────────────────────
(function initThree() {
  const canvas = document.getElementById('hero-canvas');
  if (!window.THREE || !canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.15);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xaaccff, 0.6);
  dirLight.position.set(3, 5, 5);
  scene.add(dirLight);
  const pointLight = new THREE.PointLight(0x334466, 1.5, 12);
  pointLight.position.set(-3, 2, 3);
  scene.add(pointLight);

  // Material — frosted glass-like
  const mat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    metalness: 0.6,
    roughness: 0.2,
    transparent: true,
    opacity: 0.55,
    wireframe: false,
  });
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x334466,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });

  // Shapes group
  const group = new THREE.Group();
  scene.add(group);

  const shapes = [];

  function makeShape(geo, x, y, z, scale = 1) {
    const mesh = new THREE.Mesh(geo, mat.clone());
    const wire = new THREE.Mesh(geo, wireMat.clone());
    mesh.position.set(x, y, z);
    wire.position.set(x, y, z);
    mesh.scale.setScalar(scale);
    wire.scale.setScalar(scale);
    group.add(mesh, wire);
    shapes.push({ mesh, wire, speed: 0.003 + Math.random() * 0.004, axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize() });
  }

  // Icosahedron (big, center-right)
  makeShape(new THREE.IcosahedronGeometry(1.4, 0), 2.8, 0.2, 0, 1);
  // Octahedron (mid)
  makeShape(new THREE.OctahedronGeometry(0.9, 0), -2.5, 1, -1, 1);
  // Tetrahedron (small)
  makeShape(new THREE.TetrahedronGeometry(0.6, 0), 1.0, -2, -0.5, 1);
  // Torus knot (accent)
  const torusGeo = new THREE.TorusKnotGeometry(0.5, 0.15, 80, 12);
  const torusMesh = new THREE.Mesh(torusGeo, mat.clone());
  const torusWire = new THREE.Mesh(torusGeo, wireMat.clone());
  torusMesh.position.set(-1.2, -1.5, 0.5);
  torusWire.position.set(-1.2, -1.5, 0.5);
  group.add(torusMesh, torusWire);
  shapes.push({ mesh: torusMesh, wire: torusWire, speed: 0.006, axis: new THREE.Vector3(1, 0.5, 0.3).normalize() });

  // Floating particles
  const particleCount = 120;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 14;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({ size: 0.025, color: 0x3a4a6a, transparent: true, opacity: 0.7 });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Mouse parallax
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Scroll parallax
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animate
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.008;

    // Rotate shapes
    shapes.forEach(({ mesh, wire, speed, axis }) => {
      mesh.rotateOnAxis(axis, speed);
      wire.rotation.copy(mesh.rotation);
    });

    // Mouse parallax on group
    group.rotation.y += (mouseX * 0.3 - group.rotation.y) * 0.04;
    group.rotation.x += (mouseY * 0.2 - group.rotation.x) * 0.04;

    // Scroll parallax — move group up as user scrolls
    const heroHeight = window.innerHeight;
    const scrollFactor = Math.min(scrollY / heroHeight, 1);
    group.position.y = scrollFactor * 3;
    group.children.forEach(c => { c.material.opacity = (1 - scrollFactor) * (c.material === wireMat ? 0.18 : 0.55); });

    // Subtle float
    group.position.y += Math.sin(t) * 0.004;
    particles.rotation.y = t * 0.04;

    renderer.render(scene, camera);
  }
  animate();
})();

// ── REVEAL on scroll (IntersectionObserver) ───────────────
const reveals = document.querySelectorAll('.reveal');
const heroReveal = document.querySelector('.reveal-hero');

// Hero fires immediately
setTimeout(() => heroReveal && heroReveal.classList.add('in-view'), 100);

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

reveals.forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  observer.observe(el);
});

// ── PARALLAX on scroll for sections ──────────────────────
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  document.querySelectorAll('.stat-card').forEach((el, i) => {
    el.style.transform = `translateY(${Math.sin(y * 0.003 + i) * 6}px)`;
  });
});

// ── CONTACT FORM ─────────────────────────────────────────
const form = document.getElementById('contact-form');
const note = document.getElementById('form-note');

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    note.textContent = 'Message sent — I\'ll get back to you soon.';
    note.style.color = '#8b949e';
    form.reset();
    setTimeout(() => { note.textContent = ''; }, 4000);
  });
}
