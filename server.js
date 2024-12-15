const { ConnectDB } = require("./db/db");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const cors = require("cors");
const express = require("express");
const { router } = require("./routes/route");
const session = require("express-session");
const passport = require("passport");
require("./db/passport.config")

const app = express();


const httpServer = http.createServer(app);

const PORT = process.env.PORT || 3000;

const io = new Server(httpServer, {
    cors: {
        origin: "https://omega-client-jet.vercel.app", 
        methods: ["GET", "POST"],
        credentials: true
    }
});

const userSocketMap = {}; // Maps userId to socketId
const chatRooms = {}; // Maps chatId to set of user IDs

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join_chat", ({ chatId, userId }) => {
        console.log(`User ${userId} joined chat ${chatId}`);

        // Add user to chat room
        if (!chatRooms[chatId]) {
            chatRooms[chatId] = new Set();
        }
        chatRooms[chatId].add(userId);

        // Map socket to user
        userSocketMap[userId] = socket.id;

        // Join the room
        socket.join(chatId);
    });

    socket.on("send_private_message", ({ message, chatId }) => {
        console.log("Message received on server:", message);
        io.to(chatId).emit("private_message", message);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        Object.keys(userSocketMap).forEach((key) => {
            if (userSocketMap[key] === socket.id) {
                delete userSocketMap[key];
            }
        });
    });
});

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({
    credentials: true,
    origin: (origin, callback) => {
        if (!origin || origin === "https://omega-client-jet.vercel.app") {
            callback(null, true);  // Allow your frontend URL
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

ConnectDB();

const HOST = '0.0.0.0'; // Bind to all network interfaces

httpServer.listen(PORT, HOST, () => {
    console.log(`Server is running on ${HOST}:${PORT}`);
});
