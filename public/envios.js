document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".envios-card");

    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add("visible");
        }, 150 * index);
    });
});

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