const contenedor = document.getElementById("productos-container");
const categoriasSelect = document.getElementById("categorias-container");
const inputBusqueda = document.getElementById("busqueda");
const btnBuscar = document.getElementById("btn-buscar");

async function cargarCategorias() {
  try {
    const res = await fetch("/api/categorias");
    const categorias = await res.json();
    categorias.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categoriasSelect.appendChild(opt);
    });
  } catch (error) {
    console.error("❌ Error cargando categorías", error);
  }
}

async function cargarProductos(filtroCategoria = "todos", busqueda = "") {
  try {
    let url = `/api/filtrar?categoria=${filtroCategoria}&q=${busqueda}`;
    const res = await fetch(url);
    const productos = await res.json();

    contenedor.innerHTML = "";

    if (productos.length === 0) {
      contenedor.innerHTML = "<p>No hay productos disponibles</p>";
      return;
    }

    productos.forEach(prod => {
      const div = document.createElement("div");
      div.classList.add("product-card");
      div.innerHTML = `
        <img src="${prod.imagen}" alt="${prod.nombre}">
        <h2>${prod.nombre}</h2>
        <p>$${prod.precio} MXN</p>
        <a href="detalle.html?id=${prod.id}" class="btn">Ver más</a>
      `;
      contenedor.appendChild(div);
    });
  } catch (error) {
    console.error("❌ Error cargando productos", error);
  }
}

// Eventos
btnBuscar.addEventListener("click", () => {
  cargarProductos(categoriasSelect.value, inputBusqueda.value);
});

categoriasSelect.addEventListener("change", () => {
  cargarProductos(categoriasSelect.value, inputBusqueda.value);
});

// Inicialización
cargarCategorias();
cargarProductos();

document.addEventListener("DOMContentLoaded", () => {
    const elements = document.querySelectorAll(".fade-in");
    elements.forEach((el, i) => {
        el.style.animationDelay = `${i * 0.2}s`;
    });

    const faqs = document.querySelectorAll(".faq-item");

    faqs.forEach(item => {
        const question = item.querySelector(".faq-question");

        question.addEventListener("click", () => {
            item.classList.toggle("active");
        });
    });
});
