const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const socketIo = require('socket.io');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// View engine
app.set('view engine', 'ejs');

// Routes
app.use('/', require('./routes/auth'));
app.use('/teacher', require('./routes/teacher'));
app.use('/parent', require('./routes/parent'));
app.use('/admin', require('./routes/admin'));

// Socket.io for real-time notifications
io.on('connection', (socket) => {
    console.log('User connected');
    
    socket.on('join-room', (room) => {
        socket.join(room);
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
