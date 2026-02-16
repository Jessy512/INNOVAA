document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("productos-container");
  const titulo = document.getElementById("titulo-categoria");
  const paginacion = document.getElementById("paginacion");

  const listaDropdown = document.getElementById("categoria-lista");
  const categoriasVisibles = document.getElementById("categorias-visibles");

  const params = new URLSearchParams(window.location.search);
  const categoriaSeleccionada = params.get("categoria");
  const buscar = params.get("buscar");

  const paginaParam = parseInt(params.get("pagina"), 10);

  let productosFiltrados = [];
  let productosGlobal = [];
  let paginaActual = Number.isInteger(paginaParam) && paginaParam > 0 ? paginaParam : 1;

  const productosPorPagina = 12;

  // 🔥 Reemplazamos el mensaje interno por el global estilo detalle.js
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

  try {
    const res = await fetch("/api/productos");
    const productos = await res.json();
    productosGlobal = productos;

    configurarAutocompletado(productos);

    const categorias = [...new Set(productos.map((p) => p.categoria_nombre))];

    categorias.forEach((cat) => {
      const link = document.createElement("a");
      link.textContent = cat;
      link.href = `productos.html?categoria=${encodeURIComponent(cat)}`;
      listaDropdown.appendChild(link);
    });

    categoriasVisibles.innerHTML = categorias
      .map(
        (cat) => `
        <button class="categoria-visible-btn"
          onclick="window.location.href='productos.html?categoria=${encodeURIComponent(cat)}'">
          ${cat}
        </button>
      `
      )
      .join("");

    if (buscar) {
      const texto = buscar.toLowerCase();
      const nombreBase = productos.find((p) =>
        p.producto_nombre.toLowerCase().includes(texto)
      )?.producto_nombre;

      if (nombreBase) {
        productosFiltrados = productos.filter(
          (p) => p.producto_nombre === nombreBase
        );
        titulo.textContent = `Resultados para: ${nombreBase}`;
      } else {
        productosFiltrados = [];
        titulo.textContent = "Producto no encontrado";
      }
    } else if (categoriaSeleccionada) {
      productosFiltrados = productos.filter(
        (p) => p.categoria_nombre === categoriaSeleccionada
      );
      titulo.textContent = `Categoría: ${categoriaSeleccionada}`;
    } else {
      productosFiltrados = productos;
    }

    mostrarPagina(paginaActual);
  } catch (e) {
    contenedor.innerHTML = "<p>Error al cargar productos.</p>";
    console.error(e);
  }

  function configurarAutocompletado(productos) {
    const input = document.getElementById("buscar-input");
    const lista = document.getElementById("autocomplete-list");

    input.addEventListener("input", () => {
      const texto = input.value.toLowerCase();
      if (texto.length < 1) {
        lista.style.display = "none";
        lista.innerHTML = "";
        return;
      }

      const coincidencias = productos
        .filter((p) => p.producto_nombre.toLowerCase().includes(texto))
        .map((p) => p.producto_nombre);

      const unicos = [...new Set(coincidencias)];

      if (unicos.length === 0) {
        lista.style.display = "none";
        lista.innerHTML = "";
        return;
      }

      lista.innerHTML = unicos
        .map((nombre) => `<div class="autocomplete-item">${nombre}</div>`)
        .join("");

      lista.style.display = "block";

      document.querySelectorAll(".autocomplete-item").forEach((item) => {
        item.onclick = () => {
          window.location.href = `productos.html?buscar=${encodeURIComponent(
            item.textContent
          )}`;
        };
      });
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".autocomplete-container")) {
        lista.style.display = "none";
      }
    });
  }

  function corregirImagen(url) {
    if (!url || url === "null" || url.trim() === "") {
      return "img/placeholder.png";
    }
    return url;
  }

  function mostrarPagina(pagina) {
    paginaActual = pagina;

    const inicio = (pagina - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;

    const productosPagina = productosFiltrados.slice(inicio, fin);

    contenedor.innerHTML = productosPagina
      .map(
        (p) => `
      <div class="product-card">
        <img src="${corregirImagen(p.imagen)}" alt="${p.producto_nombre}">
        <h3>${p.producto_nombre} - ${p.volumen}</h3>
        <p>${p.descripcion || "Sin descripción disponible."}</p>
        <p><strong>$${p.precio} MXN</strong></p>

        <button class="btn-agregar" 
          data-id="${p.presentacion_id}"
          data-nombre="${p.producto_nombre}"
          data-volumen="${p.volumen}"
          data-precio="${p.precio}"
          data-imagen="${corregirImagen(p.imagen)}">
          Agregar al carrito
        </button>

        <button onclick="window.location.href='detalle.html?id=${p.presentacion_id}'">
          Ver más
        </button>
      </div>
    `
      )
      .join("");

    activarBotonesAgregar();
    renderizarPaginacion();
  }

  function renderizarPaginacion() {
    const totalPaginas =
      Math.ceil(productosFiltrados.length / productosPorPagina) || 1;

    paginacion.innerHTML = "";

    for (let i = 1; i <= totalPaginas; i++) {
      const boton = document.createElement("button");
      boton.textContent = i;
      boton.className = i === paginaActual ? "active" : "";

      boton.addEventListener("click", () => {
        mostrarPagina(i);
        window.scrollTo({ top: 120, behavior: "smooth" });
      });

      paginacion.appendChild(boton);
    }
  }

  function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carrito")) || [];
  }

  function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }

  function activarBotonesAgregar() {
    document.querySelectorAll(".btn-agregar").forEach((btn) => {
      btn.addEventListener("click", () => {
        const producto = {
          presentacion_id: btn.dataset.id,
          producto_nombre: btn.dataset.nombre,
          volumen: btn.dataset.volumen,
          precio: Number(btn.dataset.precio),
          imagen: btn.dataset.imagen,
          cantidad: 1,
        };

        agregarAlCarrito(producto);
      });
    });
  }

  function agregarAlCarrito(producto) {
    const carrito = obtenerCarrito();

    const existe = carrito.find(
      (p) => p.presentacion_id === producto.presentacion_id
    );

    if (existe) {
      mostrarMensaje("Este producto ya está en el carrito");
      return;
    }

    carrito.push(producto);
    guardarCarrito(carrito);

    mostrarMensaje("Producto agregado al carrito");
  }
});
