require('dotenv').config();
const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3000;

function randomNumber(length) {
  let s = '';
  for (let i = 0; i < length; i++) s += Math.floor(Math.random() * 10);
  return s;
}

function formatDate() {
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const now = new Date();
  const h = now.getHours().toString().padStart(2,'0');
  const m = now.getMinutes().toString().padStart(2,'0');
  return `${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()} ${h}:${m}`;
}

app.post('/generar', async (req, res) => {
  try {
    const { nombre, monto } = req.body;
    if (!nombre || !monto) return res.status(400).json({ error: 'Faltan datos: nombre y monto' });

    const plantillaPath = path.join(__dirname, 'plantilla.png');
    if (!fs.existsSync(plantillaPath)) {
      return res.status(500).json({ error: 'plantilla.png no encontrada en el servidor' });
    }

    const plantilla = await loadImage(plantillaPath);
    const canvas = createCanvas(plantilla.width, plantilla.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(plantilla, 0, 0);

    ctx.fillStyle = '#000';
    ctx.font = '28px Arial';
    ctx.textBaseline = 'top';

    ctx.fillText(nombre, 70, 752);
    ctx.fillText(monto, 84, 831);

    const fecha = formatDate();
    ctx.fillText(fecha, 70, 1017);

    const referencia = 'M1' + randomNumber(7);
    ctx.fillText(referencia, 79, 1138);

    const numeroNequi = '3' + randomNumber(9);
    ctx.fillText(numeroNequi, 250, 831);

    const buffer = canvas.toBuffer('image/png');
    const base64 = buffer.toString('base64');

    res.json({ imagen: base64, referencia, fecha, numeroNequi });

  } catch (err) {
    console.error('Error en /generar:', err);
    res.status(500).json({ error: 'Error generando imagen' });
  }
});

app.get('/', (req, res) => res.send('Servidor de comprobantes activo'));

app.listen(PORT, () => console.log(`Servidor iniciado en puerto ${PORT}`));