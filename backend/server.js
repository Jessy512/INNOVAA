const express = require("express");
const { Pool } = require('pg');

//const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
require("dotenv").config();

const fs = require("fs");
const PDFDocument = require("pdfkit");

const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

//------------------------------------------------------

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});
const payment = new Payment(mpClient);
//------------------------------------------------------

const app = express();
//const PORT = process.env.PORT || 3000;

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));


// PostgreSQL conexión Render
const pool = new Pool({
  user: process.env.DB_USER || "innova_db_6alp_user",      // Usuario de Render
  host: process.env.DB_HOST || "dpg-d69fltcr85hc73daq930-a", // Host interno de Render
  database: process.env.DB_NAME || "innova_db_6alp",       // Nombre de la DB
  password: process.env.DB_PASS || "f3kWo19AzhaYWS0DZIjWqMSQystV7hFx",         // Pon aquí la contraseña real de Render
  port: process.env.DB_PORT || 5432,                       // Puerto (normalmente 5432)
  ssl: { rejectUnauthorized: false }                       // Necesario para Render
});

pool.connect(err => {
  if (err) {
    console.error('❌ Error connecting to the database', err.stack);
  } else {
    console.log('✅ Connected to the database');
  }
});



//------------------------------------------------------
// OBTENER PRODUCTOS
//------------------------------------------------------
//------------------------------------------------------
// API PRODUCTOS (CATÁLOGO)
//------------------------------------------------------
app.get("/api/productos", async (req, res) => {
  const sql = `
    SELECT
      p.id AS producto_id,
      p.nombre AS producto_nombre,
      p.descripcion,
      c.nombre AS categoria_nombre,

      pr.id AS presentacion_id,
      pr.volumen,
      pr.precio,
      pr.stock,
      pr.imagen_principal AS imagen

    FROM productos p
    INNER JOIN categorias c ON p.categoria_id = c.id
    INNER JOIN presentaciones pr ON pr.producto_id = p.id
  `;

  try {
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error productos:", err);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});



//------------------------------------------------------
// API DETALLE DE PRESENTACIÓN
//------------------------------------------------------
app.get("/api/presentacion/:id", async (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      pr.id,
      pr.volumen,
      pr.precio,
      pr.stock,
      pr.imagen_principal,
      pr.descripcion_completa,

      p.nombre AS producto_nombre,
      p.descripcion,
      c.nombre AS categoria,

      (
        SELECT json_agg(pi.url)
        FROM presentacion_imagenes pi
        WHERE pi.presentacion_id = pr.id
      ) AS imagenes

    FROM presentaciones pr
    INNER JOIN productos p ON pr.producto_id = p.id
    INNER JOIN categorias c ON p.categoria_id = c.id
    WHERE pr.id = $1
    LIMIT 1
  `;

  try {
    const result = await pool.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const data = result.rows[0];

    // Si no hay imágenes, devolver arreglo vacío
    if (!data.imagenes) {
      data.imagenes = [];
    }

    res.json(data);

  } catch (err) {
    console.error("❌ Error detalle:", err);
    res.status(500).json({ error: "Error al obtener detalle" });
  }
});



//------------------------------------------------------
// SMTP (BREVO)
//------------------------------------------------------





//------------------------------------------------------
// UTILIDAD: CREAR PDF TICKET
//------------------------------------------------------
function generarPDF({ pagoId, correo, total }) {
  return new Promise((resolve) => {
    const filePath = `./ticket-${pagoId}.pdf`;
    const doc = new PDFDocument({ margin: 40 });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text("INNOVA División Química", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text("🧾 Ticket de compra", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(12).text(`ID de pago: ${pagoId}`);
    doc.text(`Correo del cliente: ${correo}`);
    doc.text(`Total pagado: $${total} MXN`);
    doc.moveDown();

    doc.text("Gracias por tu compra 💙");
    doc.moveDown();
    doc.text("INNOVA División Química");
    doc.text("ventas@innova.com");

    doc.end();

    stream.on("finish", () => resolve(filePath));
  });
}



//------------------------------------------------------
// FORMULARIO DE CONTACTO
//------------------------------------------------------
app.post("/api/contacto", async (req, res) => {
  const { nombre, correo, telefono, empresa, mensaje } = req.body;

  if (!nombre || !correo || !telefono || !mensaje) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          email: process.env.FROM_EMAIL,
          name: "INNOVA"
        },
        to: [
          {
            email: process.env.EMAIL_SEND_TO
          }
        ],
        subject: "📩 Nuevo mensaje de contacto",
        htmlContent: `
          <h3>Nuevo mensaje de contacto</h3>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Correo:</strong> ${correo}</p>
          <p><strong>Teléfono:</strong> ${telefono}</p>
          <p><strong>Empresa:</strong> ${empresa || "No especificada"}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${mensaje}</p>
        `
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Error Brevo:", errorData);
      return res.status(500).json({ error: "No se pudo enviar el correo" });
    }

    res.json({ success: true });

  } catch (error) {
    console.error("❌ Error servidor:", error);
    res.status(500).json({ error: "Error interno" });
  }
});




//------------------------------------------------------
// CREAR PREFERENCIA MERCADO PAGO
//------------------------------------------------------
app.post("/api/crear-preferencia", async (req, res) => {
  try {
    const { items } = req.body;

    const preference = new Preference(mpClient);

    const result = await preference.create({
      body: {
        items: items.map(item => ({
          title: item.nombre || item.producto_nombre || "Producto",
          quantity: Number(item.cantidad || 1),
          unit_price: Number(item.precio),
          currency_id: "MXN"
        })),

        back_urls: {
          success: "https://innovaa-13.onrender.com/index.html",
          failure: "https://innovaa-13.onrender.com/index.html",
          pending: "https://innovaa-13.onrender.com/index.html"
        },

        notification_url:
          "https://innovaa-13.onrender.com/api/webhook-mercadopago",

        auto_return: "approved"
      }
    });

    res.json({ init_point: result.init_point });

  } catch (error) {
    console.error("❌ Error creando preferencia:", error);
    res.status(500).json({ error: "Error Mercado Pago" });
  }
});


//------------------------------------------------------
// WEBHOOK MERCADO PAGO (CONFIRMACIÓN)
//------------------------------------------------------
app.post("/api/webhook-mercadopago", async (req, res) => {
  try {
    const paymentId = req.body?.data?.id;
    if (!paymentId) return res.sendStatus(200);

    // 1️⃣ Obtener pago
    const pago = await payment.get({ id: paymentId });

    if (pago.status !== "approved") return res.sendStatus(200);

    const correoCliente = pago.payer.email;
    const total = pago.transaction_amount;
    const preferenceId = pago.preference_id;

    // 2️⃣ Obtener preferencia (para saber productos)
    const preference = new Preference(mpClient);
    const prefData = await preference.get({ preferenceId });

    const productos = prefData.items;

    // 3️⃣ Crear HTML con productos
    let listaProductos = "";
    productos.forEach(p => {
      listaProductos += `
        <li>
          ${p.title} - Cantidad: ${p.quantity} - $${p.unit_price}
        </li>
      `;
    });

    const htmlContent = `
      <h2>🛒 Detalle de tu compra</h2>
      <ul>
        ${listaProductos}
      </ul>
      <p><strong>Total pagado:</strong> $${total} MXN</p>
      <p>Gracias por tu compra 💙</p>
    `;

    // 4️⃣ Enviar correo al CLIENTE
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          email: process.env.FROM_EMAIL,
          name: "INNOVA"
        },
        to: [{ email: correoCliente }],
        subject: "🧾 Confirmación de compra - INNOVA",
        htmlContent
      })
    });

    // 5️⃣ Enviar correo al ADMIN (tú)
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          email: process.env.FROM_EMAIL,
          name: "Sistema INNOVA"
        },
        to: [{ email: process.env.EMAIL_SEND_TO }],
        subject: "💰 Nueva venta realizada",
        htmlContent: `
          <h2>Nueva venta confirmada</h2>
          <p><strong>Cliente:</strong> ${correoCliente}</p>
          ${htmlContent}
        `
      })
    });

    res.sendStatus(200);

  } catch (err) {
    console.error("❌ Error webhook:", err);
    res.sendStatus(500);
  }
});




// Esta va al final de todo server.js

app.get((req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});





