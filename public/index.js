document.addEventListener("DOMContentLoaded", async () => {
  const lista = document.getElementById("categoria-lista");
  const contenedorCategorias = document.getElementById("categorias-imagenes");

  const inputBusqueda = document.getElementById("busqueda");
  const resultadosBusqueda = document.getElementById("resultados-busqueda");

  let productos = [];

  try {
    const res = await fetch("/api/productos");
    productos = await res.json();

    const categorias = [...new Set(productos.map(p => p.categoria_nombre))];

    categorias.forEach(cat => {
      const link = document.createElement("a");
      link.textContent = cat;
      link.href = `productos.html?categoria=${encodeURIComponent(cat)}`;
      lista.appendChild(link);
    });

    categorias.forEach(cat => {
      const div = document.createElement("div");
      div.classList.add("categoria-card");

      div.innerHTML = `
        <a href="productos.html?categoria=${encodeURIComponent(cat)}">
          <img src="img/${cat}.png" alt="${cat}">
          <p>${cat}</p>
        </a>
      `;
      contenedorCategorias.appendChild(div);
    });

  } catch (err) {
    console.error("Error cargando categorías o productos", err);
  }

  // ----------------------------
  // 🔍 BUSCADOR — SOLO 1 RESULTADO POR PRODUCTO
  // ----------------------------

  inputBusqueda.addEventListener("input", () => {
    const texto = inputBusqueda.value.toLowerCase().trim();

    if (texto.length === 0) {
      resultadosBusqueda.innerHTML = "";
      resultadosBusqueda.style.display = "none";
      return;
    }

    // ❗ Solo 1 resultado por producto
    const mapa = new Map();

    productos.forEach(p => {
      const nombre = p.producto_nombre.toLowerCase();
      if (nombre.includes(texto) && !mapa.has(nombre)) {
        mapa.set(nombre, p);
      }
    });

    const coincidencias = [...mapa.values()].slice(0, 8);

    if (coincidencias.length === 0) {
      resultadosBusqueda.innerHTML = "<div class='sin-resultados'>Sin resultados</div>";
    } else {
      resultadosBusqueda.innerHTML = coincidencias
        .map(p => `
          <div class="resultado-item"
               onclick="
                 window.location.href =
                 'productos.html?buscar=${encodeURIComponent(p.producto_nombre)}&scroll=${encodeURIComponent(p.producto_nombre)}'
               ">
            ${p.producto_nombre}
          </div>
        `)
        .join("");
    }

    resultadosBusqueda.style.display = "block";
  });

  // ENTER → buscar
  inputBusqueda.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const texto = inputBusqueda.value.trim();
      if (texto.length > 0) {
        window.location.href =
          `productos.html?buscar=${encodeURIComponent(texto)}&scroll=${encodeURIComponent(texto)}`;
      }
    }
  });
});
