const express = require('express');
const bodyParser = require('body-parser');
const cookieParse = require('cookie-parser');
const cors = require("cors");


const app = express();
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    next();
});
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParse());
app.use(cors({
    origin: ["http://localhost:5173", "https://mitrajunction.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

const user = require('./route/userRoute');
const post = require('./route/postRoute');
const message = require('./route/messageRoute');

app.use("/api/v1/", user)
app.use("/api/v1/", post)
app.use("/api/v1/", message)


app.get("/", (req, res, next) => {
    res.send("<h1>Your server running on http://localhost:4000/</h1>")
})



module.exports = app;