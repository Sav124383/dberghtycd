const express = require('express');
const WebSocket = require('ws');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ noServer: true });

let variables = {};

// HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Upgrade server to support WebSocket
server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    // Store or retrieve variables
    if (data.action === 'set') {
      variables[data.key] = data.value;
      saveVariables();
      ws.send(JSON.stringify({ status: 'success', message: 'Variable saved' }));
    } else if (data.action === 'get') {
      const value = variables[data.key] || null;
      ws.send(JSON.stringify({ status: 'success', key: data.key, value }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Function to save variables to a file
function saveVariables() {
  fs.writeFileSync('variables.json', JSON.stringify(variables), 'utf8');
}

// Load variables from a file on startup
function loadVariables() {
  if (fs.existsSync('variables.json')) {
    variables = JSON.parse(fs.readFileSync('variables.json', 'utf8'));
  }
}

loadVariables();
