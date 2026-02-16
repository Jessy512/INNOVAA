document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-contacto");
  const btnEnviar = form.querySelector(".btn-enviar");
  const mensajeExito = document.getElementById("mensaje-exito");
  const mensajeError = document.getElementById("mensaje-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    mensajeExito.style.display = "none";
    mensajeError.style.display = "none";

    const data = {
      nombre: form.nombre.value.trim(),
      correo: form.correo.value.trim(),
      telefono: form.telefono.value.trim(),
      empresa: form.empresa.value.trim(),
      mensaje: form.mensaje.value.trim()
    };

    if (!data.nombre || !data.correo || !data.telefono || !data.mensaje) {
      mensajeError.textContent = "Por favor completa todos los campos obligatorios.";
      mensajeError.style.display = "block";
      return;
    }

    try {
      btnEnviar.disabled = true;
      btnEnviar.textContent = "Enviando...";

      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (res.ok && result.success) {
        mensajeExito.style.display = "block";
        form.reset();
      } else {
        mensajeError.textContent =
          result.error || "Ocurrió un error al enviar. Intenta más tarde.";
        mensajeError.style.display = "block";
      }
    } catch (err) {
      console.error(err);
      mensajeError.textContent = "Error de conexión. Intenta nuevamente.";
      mensajeError.style.display = "block";
    } finally {
      btnEnviar.disabled = false;
      btnEnviar.textContent = "Enviar";
    }
  });
});

/* ============================= */
/* MENÚ DE CATEGORÍAS            */
/* ============================= */
document.addEventListener("DOMContentLoaded", () => {
  const categorias = [
    "Limpieza Automotriz",
    "Higiene",
    "Limpieza del Hogar",
    "Especializados"
  ];

  const lista = document.getElementById("categoria-lista");
  if (!lista) return;

  categorias.forEach(cat => {
    const link = document.createElement("a");
    link.textContent = cat;
    link.href = `productos.html?categoria=${encodeURIComponent(cat)}`;
    lista.appendChild(link);
  });
});
