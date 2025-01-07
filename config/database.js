const mongoose = require('mongoose');


const connectDatabase = () => {
    mongoose.connect(process.env.DataUri, {
        family: 4, useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then((data) => {
        console.log(`Mongodb is connected with server: http://${data.connection.host}:${data.connection.port}`);
    })
}

module.exports = connectDatabase;