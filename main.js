// main.js – lógica JS central de Avenor
// Requiere: THREE.js, GSAP (ScrollTrigger), y que este script cargue con defer.

document.addEventListener('DOMContentLoaded', () => {
    /* ---------- Loader & progreso ---------- */
    const loader   = document.getElementById('loader');
    const progress = document.getElementById('progress');
    const header   = document.querySelector('header');
  
    if (loader) loader.style.display = 'none';
  
    window.addEventListener('scroll', () => {
      const scrollTop  = document.documentElement.scrollTop;
      const docHeight  = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPct  = (scrollTop / docHeight) * 100;
  
      if (header)   header.classList.toggle('scrolled', scrollTop > 50);
      if (progress) progress.style.width = scrollPct + '%';
    });
  
    /* ---------- Menú hamburguesa ---------- */
    const menuToggle = document.querySelector('.menu-toggle');
    const nav        = document.querySelector('.main-nav');
  
    if (menuToggle && nav) {
      menuToggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        menuToggle.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isOpen);
      });
    }
  
    /* ---------- Hero animaciones ---------- */
    if (window.gsap) {
      gsap.registerPlugin(ScrollTrigger);
  
      gsap.timeline()
        .to('#hero h1',  { opacity: 1, y: 0, duration: 1 })
        .to('#hero p',   { opacity: 1, y: 0, duration: 1 }, '<0.3')
        .to('#hero .btn',{ opacity: 1, y: 0, duration: 1 }, '<0.3');
    }
  
    /* ---------- Contador de métricas ---------- */
    document.querySelectorAll('#stats .stat h3').forEach(el => {
      const raw      = el.dataset.count;            // ej. "+20"
      const prefix   = /^[+-]/.test(raw) ? raw[0] : '';
      const endValue = parseInt(raw.replace(/[+-]/, ''), 10);
  
      const obj = { val: 0 };
  
      gsap.to(obj, {
        val: endValue,
        duration: 3,
        ease: 'power1.in',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          once: true
        },
        onUpdate() {
          el.textContent = prefix + Math.round(obj.val);
        }
      });
    });
  
    /* ---------- Comparador before/after ---------- */
    const range = document.getElementById('range');
    if (range) {
      range.addEventListener('input', e => {
        document.body.style.setProperty('--pos', e.target.value + '%');
      });
    }
  
    /* ---------- Partículas sección servicios ---------- */
    const section = document.querySelector('.services-section');
    const canvas  = document.getElementById('particles-bg');
  
    if (section && canvas && window.THREE) {
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
      const scene    = new THREE.Scene();
      const camera   = new THREE.PerspectiveCamera(60, 1, 1, 1000);
      camera.position.z = 200;
  
      const COUNT = 800;
      const positions = new Float32Array(COUNT * 3);
      for (let i = 0; i < positions.length; i++) {
        positions[i] = (Math.random() - 0.5) * 1000;
      }
  
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
      const material = new THREE.PointsMaterial({ color: 0xff6600, size: 2 });
      const points   = new THREE.Points(geometry, material);
      scene.add(points);
  
      function resize() {
        const { width, height } = section.getBoundingClientRect();
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
      resize();
      window.addEventListener('resize', resize);
  
      (function animate() {
        requestAnimationFrame(animate);
        points.rotation.x += 0.0005;
        points.rotation.y += 0.001;
        renderer.render(scene, camera);
      })();
    }
  
    /* ---------- Generación dinámica de cards ---------- */
    const servicesData = [
      { name: 'Gestión de Redes Sociales', desc: 'Diseñamos y ejecutamos estrategias de presencia digital. Optimizamos perfiles, planificamos contenido y potenciamos la interacción con tu audiencia para posicionar tu marca en redes sociales con coherencia y estilo.' },
      { name: 'Publicidad en Redes',           desc: 'Creamos campañas de alto rendimiento en Facebook, Instagram y Google. Segmentamos audiencias con precisión para maximizar el alcance, generar leads calificados y multiplicar el valor de tu inversión publicitaria.' },
      { name: 'Creación de Contenido',         desc: 'Desarrollamos contenido atractivo, relevante y estratégico. Desde textos hasta piezas visuales, cuidamos cada detalle para transmitir tu propuesta de valor y construir una identidad sólida.' },
      { name: 'Fotografía',                    desc: 'Capturamos espacios con estética y técnica profesional. Mostramos lo mejor de cada propiedad con imágenes de alto impacto que despiertan deseo e inspiran confianza.' },
      { name: 'Video',                         desc: 'Producimos videos dinámicos y envolventes que destacan las virtudes de tu propiedad. Sumamos narrativa visual, música e imagen profesional para enamorar a tus potenciales clientes.' },
      { name: 'Plano',                         desc: 'Elaboramos planos arquitectónicos claros y visuales. Brindamos una representación técnica y estética del espacio, ideal para que el cliente entienda dimensiones y distribución al instante.' },
      { name: 'Amueblamiento Virtual',         desc: 'Transformamos espacios vacíos en hogares soñados. Gracias a tecnología avanzada, mostramos el máximo potencial de cada ambiente con diseños virtuales elegantes, funcionales y realistas.' },
      { name: 'Tour 360',                      desc: 'Ofrecemos una experiencia inmersiva e interactiva. Nuestros recorridos virtuales permiten conocer cada rincón de una propiedad desde cualquier dispositivo, como si estuvieras allí.' },
      { name: 'Diseño Web',                    desc: 'Creamos sitios web impactantes, funcionales y 100 % responsive. Reflejamos la identidad de tu marca y optimizamos cada detalle para que tu presencia online sea profesional y efectiva.' }
    ];
  
    const grid = document.querySelector('.services-grid');
    if (grid) {
      servicesData.forEach((svc, index) => {
        const idx  = String(index + 1).padStart(2, '0');
        const card = document.createElement('div');
        card.className = 'service-card';
        card.innerHTML = `
          <div class="card-inner">
            <div class="card-face card-front">
              <div class="card-number"><span>${idx}</span></div>
              <h3 class="service-name">${svc.name}</h3>
              <button class="btn-more" aria-label="Ver más sobre ${svc.name}">Ver más +</button>
            </div>
            <div class="card-face card-back">
              <button class="btn-close" aria-label="Cerrar">✕</button>
              <h3 class="service-name">${svc.name}</h3>
              <p class="description">${svc.desc}</p>
            </div>
          </div>
        `;
        grid.appendChild(card);
      });
  
      grid.addEventListener('click', e => {
        const card = e.target.closest('.service-card');
        if (!card) return;
        if (e.target.matches('.btn-more')) card.classList.add('flipped');
        if (e.target.matches('.btn-close')) card.classList.remove('flipped');
      });
    }
  });
  