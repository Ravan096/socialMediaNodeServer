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
const ChatModel = require("./model/chatModel");
const agent = new http.Agent({
    rejectUnauthorized: false
});
const { addSocket, getSocketIds, removeSocket } = require("./lib/socketStore")


dotenv.config({ path: "config/config.env" })
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 },
    store: MongoStore.create({ mongoUrl: process.env.DataUri })
}))
// app.use(passport.authenticate("session"))
app.use(passport.initialize());
app.use(passport.session());

// const userSocketIds = new Map();

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

// module.exports = userSocketIds = new Map();

io.on("connection", (socket) => {
    // console.log(`User connected: ${socket.id}`);
    const user = socket.user;
    // console.log("👉 socket.user:", users);
    // console.log("✅ Mapping user ID to socket:", users._id.toString(), socket.id);
    addSocket(user._id.toString(), socket.id);
    socket.on("joinChat", (chatId) => {
        socket.join(chatId);
    });

    // **Handle typing event**
    socket.on("typing", (data) => {
        socket.broadcast.emit("userTyping", { username: users[socket.id], chatId: data.chatId });
    });

    socket.on("stopTyping", (data) => {
        socket.broadcast.emit("userStopTyping", { username: users[socket.id], chatId: data.chatId });
    });

    socket.on("NEW_MESSAGES", async ({ chatId, members, message }) => {

        if (!chatId || !members || !message) {
            console.error("Missing data in NEW_MESSAGES", { chatId, members, message });
            return;
        }

        const messageForRealTime = {
            content: message,
            _id: v4(),
            sender: {
                _id: user._id,
                name: user.FullName
            },
            chat: chatId,
            createdAt: new Date().toISOString()
        };
        const messageForDb = {
            content: message,
            senderId: user._id,
            chat: chatId
        };

        try {
            const senderId = user._id.toString();
            const update = {
                $set: {
                    lastMessage: message,
                    updatedAt: new Date()
                }
            };
            const unsetSender = members.filter(m => m !== senderId);
            unsetSender.forEach(id => {
                update.$inc = {
                    ...(update.$inc || {}),
                    [`unreadCounts.${id}`]: 1
                }
            })
            await ChatModel.findByIdAndUpdate(chatId, update);

            unsetSender.forEach(async (id) => {
                const socketIds = getSocketIds(id);
                if (socketIds && socketIds.length > 0) {
                    const chat = await ChatModel.findById(chatId);
                    const newCount = chat.unreadCounts?.[id] || 0;

                    socketIds.forEach(socketId => {
                        io.to(socketId).emit("UPDATE_UNREAD_COUNT", {
                            chatId,
                            count: newCount
                        });
                    });
                }
            })
        } catch (error) {
            console.log("failed to update chat metadata", error)
        }


        members.forEach(member => {
            const socketIds = getSocketIds(member._id || member);
            socketIds.forEach(sId => {
                io.to(sId).emit("NEW_MESSAGES", {
                    chatId,
                    message: messageForRealTime,
                });
                io.to(sId).emit("NEW_MESSAGEALERTS", { chatId });
            });
        });


        await MessageModel.create(messageForDb);
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
        removeSocket(user._id.toString(), socket.id);
    });
});



server.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`)
});


// module.exports = { userSocketIds }