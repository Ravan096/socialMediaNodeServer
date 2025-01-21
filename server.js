const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');
const { Server } = require("socket.io");
const { createServer } = require('http');
const cloudinary = require("cloudinary");
const http = require("https");
const agent = new http.Agent({
    rejectUnauthorized: false
})



dotenv.config({ path: "config/config.env" })
connectDatabase();

cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
    secure: true,
});


const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173/","https://mitrajunction.netlify.app/"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials:true,
    }
});
let user = {}


io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

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
        const username = users[socket.id];
        socket.broadcast.emit("userLeft", `${username} has left the chat.`);
        delete users[socket.id];
    });
});



server.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`)
})