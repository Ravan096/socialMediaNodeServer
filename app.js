const express = require('express');
const bodyParser = require('body-parser');


const app = express();
app.use(express.json());
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

const user = require('./route/userRoute');
const post = require('./route/postRoute');

app.use("/api/v1/",user)
app.use("/api/v1/",post)



module.exports = app;