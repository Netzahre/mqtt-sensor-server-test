const express = require('express');
const mqtt = require('mqtt');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
const db = new sqlite3.Database('mqtt_data.db');
db.run(`CREATE TABLE IF NOT EXISTS datos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  valor TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

const mqttClient = mqtt.connect('mqtt://localhost:1883');

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    mqttClient.subscribe('sensor/dato');
});



mqttClient.on('message', (topic, message) => {
    const valor = message.toString();
    console.log(`Received message: ${valor} on topic: ${topic}`);

    db.run(`INSERT INTO datos (valor) VALUES (?)`, [valor], function (err) {
        if (err) {
            console.error('Database insert error:', err);
        } else {
            console.log(`Data inserted with ID: ${this.lastID}`);
        }
    });
});

app.post('/dato', (req, res) => {
    db.get(`SELECT valor FROM datos ORDER BY timestamp DESC LIMIT 1`, (err, row) => {
        if (err) { return res.status(500).send('Database error'); }
        if (!row) return res.status(404).json({ error: 'No hay datos aún' });

        res.json({ dato: row.valor });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});