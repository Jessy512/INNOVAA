/********************************************
 * MENÚ DESPLEGABLE (categorías)
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
 * ACORDEÓN FAQ — FUNCIONAL
 ********************************************/
document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".faq-item");

    items.forEach(item => {
        const btn = item.querySelector(".faq-question");

        btn.addEventListener("click", () => {
            item.classList.toggle("active");
        });
    });
});
