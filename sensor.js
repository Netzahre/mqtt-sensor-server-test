const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://localhost:1883");
console.log("Intentando conectar al broker...");
client.on("connect", () => {
    console.log("Conectado al broker MQTT");
    setInterval(() => {
        const valor = (Math.random() * 100).toFixed(2);
        console.log(`Enviando: ${valor}`);
        client.publish("sensor/dato", valor.toString());
    }, 1000);
});

client.on("error", (err) => {
    console.error("Error de conexión:", err.message);
});

client.on("reconnect", () => {
    console.log("Reintentando conectar...");
});

client.on("offline", () => {
    console.log("Cliente está offline");
});

client.on("close", () => {
    console.log("Conexión cerrada");
});