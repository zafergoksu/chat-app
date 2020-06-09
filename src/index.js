const { server, io } = require('./app');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const port = process.env.PORT;

io.on('connection', (socket) => {
    console.log('new websocket connection!');


    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });
        console.log(error, user);

        if (error) {
            return callback(error); 
        }

        socket.join(user.room);
        socket.emit('message', generateMessage('Welcome!'));
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username, `${user.username} has joined!`));

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();
        const user = getUser(socket.id);

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed');
        }
        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback();
    });

    socket.on('sendLocation', (position, callback) => {
        const user = getUser(socket.id);
        io.emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${position.latitude},${position.longitude}`));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
});

server.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});
