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
