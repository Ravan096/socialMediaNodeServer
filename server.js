const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');
const { Server } = require("socket.io");
const { createServer } = require('http');
const cloudinary = require("cloudinary");
const http = require("https");
const { connectPassport } = require('./utils/authProvider');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { getSockets } = require('./lib/helper');
const { NEW_MESSAGEALERTS } = require('./constants/constant');
const MessageModel = require('./model/messageModel');
const cookieParser = require('cookie-parser');
const { v4 } = require('uuid');
const { userSocketIds } = require('./lib/socketStore');
const { socketAuth } = require('./middleware/auth');
const agent = new http.Agent({
    rejectUnauthorized: false
})


dotenv.config({ path: "config/config.env" })
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 },
    // store: MongoStore.create({mongoUrl:process.env.DataUri})
}))
// app.use(passport.authenticate("session"))
app.use(passport.initialize());
app.use(passport.session());



connectDatabase();
connectPassport();


cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true,
});


const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["https://mitrajunction.netlify.app", "http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    }
});

// io.use((socket, next) => {
//    (
//         socket.request,
//         socket.request.res,
//         async (err) => await socketAuth(err, socket, next))
// });

io.use(async (socket, next) => {
    await socketAuth(null, socket, next);
});


io.on("connection", (socket) => {
    // console.log(`User connected: ${socket.id}`);
    const users = socket.user;
    // console.log(users)
    userSocketIds.set(users._id.toString(), socket.id)

    // **User joins the chat**
    socket.on("joinChat", (username) => {
        users[socket.id] = username;
        console.log(`${username} joined the chat`);
        socket.broadcast.emit("userJoined", `${username} has joined the chat.`);
    });

    // **Handle typing event**
    socket.on("typing", (data) => {
        socket.broadcast.emit("userTyping", { username: users[socket.id], chatId: data.chatId });
    });

    socket.on("stopTyping", (data) => {
        socket.broadcast.emit("userStopTyping", { username: users[socket.id], chatId: data.chatId });
    });

    socket.on("NEW_MESSAGES", async ({ chatId, members, message }) => {
        const messageForRealTime = {
            content: message,
            _id: v4(),
            sender: {
                _id: users._id,
                name: users.FullName
            },
            chat: chatId,
            createdAt: new Date().toISOString()
        };
        const messageForDb = {
            content: message,
            sender: users._id,
            chat: chatId
        };
        const usersocket = getSockets(members);
        io.to(usersocket).emit("NEW_MESSAGES", {
            chatId,
            message: messageForRealTime
        });
        io.to(usersocket).emit(NEW_MESSAGEALERTS, { chatId })
        await MessageModel.create(messageForDb)
        // socket.broadcast.emit(NEW_MESSAGES, data);
    });

    // **Handle sending a message**
    socket.on("sendMessage", (messageData) => {
        const { chatId, message } = messageData;
        const username = users[socket.id];
        console.log(`${username} sent a message: ${message}`);

        // Broadcast message to other users
        io.emit("receiveMessage", {
            username,
            chatId,
            message,
            timestamp: new Date().toISOString()
        });
    });

    // **Handle user disconnection**
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        userSocketIds.delete(users._id.toString())
        const username = users[socket.id];
        socket.broadcast.emit("userLeft", `${username} has left the chat.`);
        delete users[socket.id];
    });
});



server.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`)
});


// module.exports = { userSocketIds }