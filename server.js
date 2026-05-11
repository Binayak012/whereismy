require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('io', io);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/upload', require('./routes/upload'));

app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});
// serve mapbox token to authenticated frontend
app.get('/api/map-token', (req, res) => {
  res.json({ token: process.env.MAPBOX_TOKEN });
});
io.on('connection', (socket) => {
  console.log('user connected:', socket.id);
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});