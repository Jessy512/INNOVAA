// carrito.js
// Maneja el carrito guardado en localStorage bajo la clave "carrito"

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

  renderCarrito();
  inicializarBotones();
});

/* -------------------------------------- */
/* FUNCIONES BASE */
/* -------------------------------------- */
function obtenerCarrito() {
  return JSON.parse(localStorage.getItem("carrito")) || [];
}

function guardarCarrito(carrito) {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function formatearMoneda(n) {
  return Number(n).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function calcularTotales(carrito) {
  const subtotal = carrito.reduce(
    (s, it) => s + (Number(it.precio) * Number(it.cantidad)), 0
  );
  return { subtotal, envio: 0, total: subtotal };
}

/* -------------------------------------- */
/* MENSAJE FLOTANTE */
/* -------------------------------------- */
function mostrarMensaje(texto) {
  const msg = document.getElementById("mensaje-carrito");
  msg.textContent = texto;
  msg.classList.add("visible");

  setTimeout(() => {
    msg.classList.remove("visible");
  }, 2500);
}

/* -------------------------------------- */
/* RENDER DEL CARRITO */
/* -------------------------------------- */
function renderCarrito() {
  const carrito = obtenerCarrito();
  const vacio = document.getElementById("carrito-vacio");
  const contenedor = document.getElementById("carrito-contenedor");
  const lista = document.getElementById("lista-items");

  if (carrito.length === 0) {
    vacio.style.display = "block";
    contenedor.style.display = "none";
    return;
  }

  vacio.style.display = "none";
  contenedor.style.display = "flex";
  lista.innerHTML = "";

  carrito.forEach((item, idx) => {
    const div = document.createElement("div");
    div.className = "item-carrito";

    div.innerHTML = `
      <div class="img-wrap"><img src="${item.imagen}" alt=""></div>
      <div class="info">
        <h3>${item.producto_nombre} ${item.volumen ? `(${item.volumen})` : ""}</h3>
        <p class="precio">${formatearMoneda(item.precio)} cada</p>

        <div class="cantidad-controls">
          <button class="qty-decrease" data-idx="${idx}">-</button>
          <input class="qty-input" type="number" min="1" value="${item.cantidad}" data-idx="${idx}">
          <button class="qty-increase" data-idx="${idx}">+</button>
        </div>

        <p class="subtotal-item">
          Subtotal: ${formatearMoneda(item.precio * item.cantidad)}
        </p>

        <button class="btn-negro btn-eliminar" data-idx="${idx}">
          Eliminar
        </button>
      </div>
    `;
    lista.appendChild(div);
  });

  const { subtotal, envio, total } = calcularTotales(carrito);

  document.getElementById("subtotal-line").textContent =
    `Subtotal: ${formatearMoneda(subtotal)}`;

  const envioLine = document.getElementById("envio-line");
  if (envioLine) envioLine.textContent = `Envío: ${formatearMoneda(envio)}`;

  const totalLine = document.getElementById("total-line");
  if (totalLine) totalLine.textContent = `Total: ${formatearMoneda(total)}`;

  attachEvents();
}

/* -------------------------------------- */
/* EVENTOS */
/* -------------------------------------- */
function attachEvents() {
  document.querySelectorAll(".qty-decrease").forEach(btn => {
    btn.onclick = () => cambiarCantidad(btn.dataset.idx, -1);
  });

  document.querySelectorAll(".qty-increase").forEach(btn => {
    btn.onclick = () => cambiarCantidad(btn.dataset.idx, 1);
  });

  document.querySelectorAll(".qty-input").forEach(input => {
    input.onchange = () => setCantidad(input.dataset.idx, input.value);
  });

  document.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.onclick = () => eliminarItem(btn.dataset.idx);
  });
}

function cambiarCantidad(idx, delta) {
  const carrito = obtenerCarrito();
  carrito[idx].cantidad = Math.max(1, carrito[idx].cantidad + delta);
  guardarCarrito(carrito);
  renderCarrito();
}

function setCantidad(idx, cant) {
  const carrito = obtenerCarrito();
  carrito[idx].cantidad = Math.max(1, Number(cant));
  guardarCarrito(carrito);
  renderCarrito();
}

function eliminarItem(idx) {
  const carrito = obtenerCarrito();
  carrito.splice(idx, 1);
  guardarCarrito(carrito);
  renderCarrito();
}

/* -------------------------------------- */
/* BOTONES PRINCIPALES */
/* -------------------------------------- */
function inicializarBotones() {
  document.getElementById("vaciar-carrito").onclick = () => {
    localStorage.removeItem("carrito");
    mostrarMensaje("El carrito ha sido vaciado");
    renderCarrito();
  };

  document.getElementById("pagar-ahora").onclick = () => {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
      mostrarMensaje("Tu carrito está vacío");
      return;
    }
    localStorage.setItem("checkout_autorizado", "true");
    window.location.href = "pagar.html";
  };
}
