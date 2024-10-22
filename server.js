const express = require('express');
const WebSocket = require('ws');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

const server = app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

const wss = new WebSocket.Server({ server });

// Store variables
let variables = {};

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        // Handle save and retrieve commands
        if (data.command === 'save') {
            variables[data.key] = data.value;
            ws.send(JSON.stringify({ status: 'success', message: 'Data saved' }));
        } else if (data.command === 'retrieve') {
            const value = variables[data.key] || null;
            ws.send(JSON.stringify({ status: 'success', value }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
