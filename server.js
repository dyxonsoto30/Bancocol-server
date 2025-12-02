// Servidor básico para recibir nombre y monto (simulando tu bot)
const express = require("express");
const app = express();
app.use(express.json());

app.post("/generar", (req, res) => {
    const { nombre, monto } = req.body;

    if (!nombre || !monto) {
        return res.status(400).json({ error: "Faltan datos" });
    }

    const fecha = new Date().toLocaleString("es-CO", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
    });

    const referencia = "M" + Math.floor(Math.random() * 90000000 + 10000000);

    res.json({
        nombre,
        monto,
        fecha,
        referencia
    });
});

app.get("/", (req, res) => {
    res.send("Servidor funcionando");
});

app.listen(3000, () => {
    console.log("Servidor activo en puerto 3000");
});
