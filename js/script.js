// ===== CONTADOR REGRESIVO =====
const fechaEvento = new Date("August 30, 2025 12:00:00").getTime();

const actualizarContador = () => {
  const ahora = new Date().getTime();
  const distancia = fechaEvento - ahora;

  const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
  const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

  // Usamos textContent para seguridad (evita XSS)
  document.getElementById("dias").textContent = dias.toString().padStart(2, '0');
  document.getElementById("horas").textContent = horas.toString().padStart(2, '0');
  document.getElementById("minutos").textContent = minutos.toString().padStart(2, '0');
  document.getElementById("segundos").textContent = segundos.toString().padStart(2, '0');

  if (distancia < 0) {
    clearInterval(intervalo);
    document.getElementById("timer").innerHTML = "¡Es el día!";
  }
};

// Limpiamos el intervalo al salir para evitar fugas de memoria
const intervalo = setInterval(actualizarContador, 1000);
window.addEventListener('beforeunload', () => clearInterval(intervalo));

// ===== MAPA LEAFLET =====
document.addEventListener('DOMContentLoaded', () => {
  const ayuntamiento = [37.20773942659509, -3.6331526497618167];
  const bureo = [37.203739254223166, -3.638337982684902];
  const parking = [37.20463164521322, -3.63761135989847];

  const map = L.map('map').setView(ayuntamiento, 15);

  // Añadidos atributos de capa base alternativas
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map);

  // Iconos más accesibles (mejor contraste)
  const crearIcono = (numero) => L.divIcon({
    html: `<div style="
      background: #C54B40; 
      color: white;
      border-radius: 8px;
      width: 34px; 
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 0 5px rgba(0,0,0,0.3);
      font-size: 1.1em;
    ">${numero}</div>`,
    className: '',
    iconSize: [34, 34], 
    iconAnchor: [17, 17]
  });

  // Marcadores 
  const marcadores = [
    { pos: parking, num: 1, texto: "<b>1. Parking gratuito</b>" },
    { pos: ayuntamiento, num: 2, texto: "<b>2. Ayuntamiento de Maracena</b><br>(Ceremonia)" },
    { pos: bureo, num: 3, texto: "<b>3. Bureo</b><br>(Celebración)" }
  ];

  marcadores.forEach(m => {
    L.marker(m.pos, { icon: crearIcono(m.num) })
      .addTo(map)
      .bindPopup(`
        ${m.texto}<br>
        <a href="https://maps.google.com/?q=${m.pos[0]},${m.pos[1]}" 
           target="_blank" 
           style="color:#C54B40;text-decoration:underline;"> <!-- NEW: Color actualizado -->
          Abrir en Maps
        </a>
      `);
  });

  // Ajuste automático de vista en móvil
  if (window.innerWidth <= 768) {
    map.fitBounds([
      parking,
      bureo
    ], { padding: [50, 50] });
  } else {
    map.openPopup(); 
  }
});

// ===== FORMULARIO =====
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('rsvpForm');
  const modal = document.getElementById('modalConfirmacion');
  const modalTitulo = document.getElementById('modalTitulo'); 
  const modalSubtitulo = document.getElementById('modalSubtitulo');
  const cerrarModalBtn = document.getElementById('cerrarModal');
  const asistencia = document.getElementById('asistencia');
  const numPersonas = document.getElementById('numPersonas');

  // Objeto con mensajes dinámicos
  const mensajes = {
    'Sí': {
      titulo: '🎉 ¡Gracias por confirmar tu asistencia! 🎉',
      subtitulo: 'Estamos deseando compartir este día con vosotras'
    },
    'No': {
      titulo: 'Ohhhhhh!!! Seguro?',
      subtitulo: 'Nos lo vamos a pasar genial, pero lo entendemos. ¡Gracias por avisar!'
    }
  };

  // Envío del formulario
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          // Actualiza el modal según la respuesta
          const respuesta = asistencia.value;
          modalTitulo.textContent = mensajes[respuesta].titulo;
          modalSubtitulo.textContent = mensajes[respuesta].subtitulo;
          
          modal.style.display = 'block';
          form.reset();
          window.scrollTo({
            top: modal.offsetTop,
            behavior: 'smooth'
          });
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al enviar. Por favor, inténtalo de nuevo.');
      }
    });
  }

  // Cerrar modal
  if (cerrarModalBtn) {
    cerrarModalBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  // Control campo numPersonas
  if (asistencia && numPersonas) {
    asistencia.addEventListener('change', () => {
      const isAttending = asistencia.value === 'Sí';
      numPersonas.disabled = !isAttending;
      numPersonas.required = isAttending;
      numPersonas.value = isAttending ? '1' : '';
      if (!isAttending) numPersonas.min = 0;
    });

    // Inicialización
    if (asistencia.value === 'No') {
      numPersonas.disabled = true;
      numPersonas.required = false;
    }
  }
});