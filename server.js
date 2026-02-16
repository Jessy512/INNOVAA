const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public"))); // 👈 ahora sí sirve los .html de public/

// Conexión a MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Mocosito1416",
  database: "innova"
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error conectando a MySQL:", err);
    return;
  }
  console.log("✅ Conectado a MySQL");
});

// Rutas API
app.get("/api/productos", (req, res) => {
  db.query("SELECT * FROM productos", (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error en la consulta");
    } else {
      res.json(results);
    }
  });
});


app.get("/api/productos/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM productos WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).send("Error en la consulta");
    if (results.length > 0) res.json(results[0]);
    else res.status(404).send("Producto no encontrado");
  });
});

app.post("/api/ventas", (req, res) => {
  const { productos, total, metodo_pago } = req.body;
  db.query(
    "INSERT INTO ventas (total, metodo_pago) VALUES (?, ?)",
    [total, metodo_pago],
    (err, result) => {
      if (err) return res.status(500).send("Error al registrar la venta");

      const ventaId = result.insertId;
      productos.forEach((p) => {
        db.query(
          "INSERT INTO detalle_venta (venta_id, producto_id, cantidad, subtotal) VALUES (?, ?, ?, ?)",
          [ventaId, p.id, p.cantidad, p.subtotal]
        );
      });
      res.json({ message: "✅ Venta registrada correctamente" });
    }
  );
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
