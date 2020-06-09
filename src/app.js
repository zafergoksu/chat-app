require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
//const hbs = require('hbs');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectory = path.join(__dirname, '../public');

//app.set('view engine', 'hbs');
app.use(express.static(publicDirectory));

module.exports = {
    server,
    io
};