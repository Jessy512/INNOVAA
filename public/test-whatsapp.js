require("dotenv").config();
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

client.messages.create({
  from: process.env.WHATSAPP_FROM, // debe ser +14155238886 si usas sandbox
  to: process.env.WHATSAPP_TO,     // tu número real que se unió al sandbox
  body: "¡Hola! Esto es un mensaje de prueba desde Twilio Sandbox WhatsApp ✅"
})
.then(msg => console.log("Mensaje enviado:", msg.sid))
.catch(err => console.error("Error enviando WhatsApp:", err));
