/********************************************
 * 1. MENÚ DESPLEGABLE — ARREGLADO
 ********************************************/
document.addEventListener("DOMContentLoaded", () => {
  const categorias = [
    "Limpieza Automotriz",
    "Higiene",
    "Limpieza del Hogar",
    "Especializados"
  ];

  const lista = document.getElementById("categoria-lista");

  categorias.forEach(cat => {
    const link = document.createElement("a");
    link.textContent = cat;
    link.href = `productos.html?categoria=${cat}`;
    lista.appendChild(link);
  });
});


/********************************************
 * 2. CARGAR DETALLE
 ********************************************/
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function cargarDetalle() {
  try {
    const res = await fetch(`/api/presentacion/${id}`);
    const data = await res.json();

    document.getElementById("detalle-nombre").textContent =
      `${data.producto_nombre} ${data.volumen ? `(${data.volumen})` : ""}`;

    document.getElementById("detalle-precio").textContent = `$${data.precio} MXN`;
    document.getElementById("detalle-categoria").textContent = `Categoría: ${data.categoria}`;
    document.getElementById("detalle-stock").textContent = `Stock: ${data.stock}`;

    document.getElementById("detalle-descripcion").textContent = data.descripcion || "";

    if (data.descripcion_completa) {
      const texto = data.descripcion_completa
        .replace(/USOS:/g, "\n\nUSOS:")
        .replace(/MODO DE EMPLEO:/g, "\n\nMODO DE EMPLEO:")
        .replace(/PRECAUCIONES:/g, "\n\nPRECAUCIONES:");

      document.getElementById("detalle-completa").textContent = texto;
    }

    const fotos =
      Array.isArray(data.imagenes) && data.imagenes.length
        ? data.imagenes
        : [data.imagen_principal || "img/placeholder.png"];

    const container = document.getElementById("carousel-container");

    container.innerHTML = `
      <div class="carousel">
        ${fotos
          .map(
            (f, i) => `
          <div class="slide" style="display:${i === 0 ? "block" : "none"};">
            <img src="${f}" class="carousel-img">
          </div>`
          )
          .join("")}
        <button id="prev" class="carousel-btn">❮</button>
        <button id="next" class="carousel-btn">❯</button>
      </div>
    `;

    const slides = [...container.querySelectorAll(".slide")];
    let index = 0;

    const show = (i) => {
      slides.forEach((s, j) => (s.style.display = j === i ? "block" : "none"));
    };

    document.getElementById("next").onclick = () => {
      index = (index + 1) % slides.length;
      show(index);
    };

    document.getElementById("prev").onclick = () => {
      index = (index - 1 + slides.length) % slides.length;
      show(index);
    };

    /********************************************
     * BOTONES
     ********************************************/
    document.getElementById("agregar-btn").onclick = () => {
      let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

      const existe = carrito.find(p => p.presentacion_id == data.id);

      if (existe) {
        mostrarMensaje("Este producto ya está en el carrito");
        return;
      }

      carrito.push({
        presentacion_id: data.id,
        producto_nombre: data.producto_nombre,
        volumen: data.volumen,
        precio: data.precio,
        imagen: data.imagen_principal,
        cantidad: 1
      });

      localStorage.setItem("carrito", JSON.stringify(carrito));
      mostrarMensaje("Producto agregado al carrito");
    };

    document.getElementById("volver-btn").onclick = () => history.back();
    document.getElementById("comprar-btn").onclick = () => {
      window.location.href = "carrito.html";
    };

  } catch (err) {
    console.error("Error en detalle:", err);
  }
}

function mostrarMensaje(texto) {
  const div = document.createElement("div");
  div.className = "mensaje-carrito";
  div.textContent = texto;

  document.body.appendChild(div);

  setTimeout(() => div.classList.add("visible"), 50);

  setTimeout(() => {
    div.classList.remove("visible");
    setTimeout(() => div.remove(), 300);
  }, 2500);
}

cargarDetalle();
