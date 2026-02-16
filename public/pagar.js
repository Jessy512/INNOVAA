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


// public/pagar.js
if (!localStorage.getItem("checkout_autorizado")) {
  window.location.href = "carrito.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  const envioSelect = document.getElementById("solicita-envio");
  const datosEnvio = document.getElementById("datos-envio");
  const facturaSelect = document.getElementById("factura");
  const datosFactura = document.getElementById("datos-factura");

  const itemsList = document.getElementById("items-list");
  const subtotalLine = document.getElementById("subtotal-line");
  const envioLine = document.getElementById("envio-line");
  const totalLine = document.getElementById("total-line");

  const btnPagar = document.getElementById("btn-pagar");
  const errorMsg = document.getElementById("error-msg");

  const ENVIO_COSTO = 100;

  /* ------------------ */
  /* UTILIDADES */
  /* ------------------ */
  const moneda = n => n.toLocaleString("es-MX", { style:"currency", currency:"MXN" });

  function calcularSubtotal() {
    return carrito.reduce((s, it) => s + it.precio * it.cantidad, 0);
  }

  function actualizarResumen() {
  itemsList.innerHTML = "";

  carrito.forEach(it => {
    itemsList.innerHTML += `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <img src="${it.imagen}" style="width:45px;height:45px;object-fit:cover;border-radius:6px;">
        <div>
          <div style="font-size:14px;">${it.producto_nombre}</div>
          <div style="font-size:12px;color:#555;">Cantidad: ${it.cantidad}</div>
        </div>
      </div>
    `;
  });

  const subtotal = calcularSubtotal();
  const envio = envioSelect.value === "si" ? ENVIO_COSTO : 0;
  const total = subtotal + envio;

  subtotalLine.textContent = `Subtotal: ${moneda(subtotal)}`;
  envioLine.textContent = envio === 0 ? "Envío: Gratis" : `Envío: ${moneda(envio)}`;
  totalLine.textContent = `Total: ${moneda(total)}`;
}


  function obtenerMetodoPago() {
    return document.querySelector('input[name="metodo"]:checked')?.value;
  }

  /* ------------------ */
  /* EVENTOS */
  /* ------------------ */
  envioSelect.onchange = () => {
    datosEnvio.style.display = envioSelect.value === "si" ? "block" : "none";
    actualizarResumen();
  };

  facturaSelect.onchange = () => {
    datosFactura.style.display = facturaSelect.value === "si" ? "block" : "none";
  };

  btnPagar.onclick = async () => {
    errorMsg.style.display = "none";

    const correo = document.getElementById("correo").value.trim();
    const metodo = obtenerMetodoPago();

    if (!correo) {
      errorMsg.textContent = "Correo requerido";
      errorMsg.style.display = "block";
      return;
    }

    if (metodo === "mercadopago") {
      try {
        const res = await fetch("/api/crear-preferencia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cliente: { correo },
            items: carrito.map(it => ({
            nombre: it.producto_nombre,
            cantidad: it.cantidad,
            precio: Number(it.precio) // 🔥 FIX
        }))
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        window.location.href = data.init_point;
      } catch (err) {
        errorMsg.textContent = err.message || "Error en pago";
        errorMsg.style.display = "block";
      }
    }
  };

  

  /* INIT */
  actualizarResumen();
});
