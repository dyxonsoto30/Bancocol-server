require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Inicializar bot con token de variable de entorno
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

console.log("Bot iniciado ✅");

// Funciones para leer y guardar datos
function leerDatos() {
    try { return JSON.parse(fs.readFileSync('datos.json')); } 
    catch { return {}; }
}

function guardarDatos(datos) {
    fs.writeFileSync('datos.json', JSON.stringify(datos, null, 2));
}

const datosUsuarios = leerDatos();

// Coordenadas de texto en la plantilla
const coordenadas = {
    nombre: { x: 79, y: 46 },
    fecha: { x: 100, y: 100 },
    monto: { x: 100, y: 150 },
    horaGeneracion: { x: 300, y: 180 }
};

// Debug: cada mensaje recibido
bot.on('message', (msg) => {
    console.log('Mensaje recibido:', msg.text);
});

// Comando /comprobante
bot.onText(/\/comprobante (.+);(.+);(.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const [nombre, fecha, monto] = match.slice(1);

    if (!datosUsuarios[chatId]) datosUsuarios[chatId] = [];
    datosUsuarios[chatId].push({ nombre, fecha, monto });
    guardarDatos(datosUsuarios);

    bot.sendMessage(chatId, 'Comprobante guardado ✅');

    try {
        const plantilla = await loadImage(path.join(__dirname, 'plantilla.png'));
        const canvas = createCanvas(plantilla.width, plantilla.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(plantilla, 0, 0);
        ctx.fillStyle = '#000';

        const datos = datosUsuarios[chatId][datosUsuarios[chatId].length - 1];

        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(datos.nombre, coordenadas.nombre.x, coordenadas.nombre.y);
        ctx.fillText(datos.fecha, coordenadas.fecha.x, coordenadas.fecha.y);
        ctx.fillText(datos.monto, coordenadas.monto.x, coordenadas.monto.y);

        const ahora = new Date();
        ctx.font = '16px Arial';
        ctx.fillText(`Generado: ${ahora.toLocaleString()}`, coordenadas.horaGeneracion.x, coordenadas.horaGeneracion.y);

        const archivo = `datos_${chatId}.png`;
        fs.writeFileSync(archivo, canvas.toBuffer('image/png'));

        bot.sendPhoto(chatId, archivo);
        console.log('Imagen enviada al chat:', chatId);

    } catch (err) {
        console.error('Error generando la imagen:', err);
        bot.sendMessage(chatId, 'Ocurrió un error al generar la imagen 😢');
    }
});