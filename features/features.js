const { getSockets } = require("../lib/helper");

const emitEvent = (req, event, users, data) => {
    console.log("event", event, data);
    const io = req.app.get("io");
    const userSocket = getSockets(users);
    io.to(userSocket).emit(event, data)
}

module.exports = { emitEvent }