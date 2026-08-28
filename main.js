// RentoCampo landing - Formulario funcional
// IMPORTANTE: Reemplazá este número con el WhatsApp real en formato internacional, sin + ni espacios.
const WHATSAPP_NUMBER = "549XXXXXXXXXX";

const form = document.getElementById("leadForm");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  
  const data = new FormData(form);
  const nombre = data.get("nombre") || "";
  const telefono = data.get("telefono") || "";
  const provincia = data.get("provincia") || "";
  const hectareas = data.get("hectareas") || "";
  const comentario = data.get("comentario") || "";

  const message = [
    "🌾 *Hola RentoCampo, quiero publicar mi campo.*",
    "",
    "*Nombre:* " + nombre,
    "*Teléfono:* " + telefono,
    "*Provincia:* " + provincia,
    "*Hectáreas aprox.:* " + (hectareas || "Sin informar"),
    "*Comentario:* " + (comentario || "Sin comentario"),
  ].join("\n");

  if (WHATSAPP_NUMBER.includes("X")) {
    alert("⚠️ Completá el número de WhatsApp en main.js antes de publicar este formulario.\n\nBuscá WHATSAPP_NUMBER = \"549XXXXXXXXXX\" y reemplazá con tu número.");
    return;
  }

  // Abre WhatsApp con el mensaje pre-llenado
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
});

// Smooth scroll para links internos (fallback si CSS no funciona)
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href !== '#' && document.querySelector(href)) {
      e.preventDefault();
      document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Log de inicialización
console.log('🌾 RentoCampo landing cargada correctamente');