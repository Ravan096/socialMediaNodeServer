const { userSocketIds } = require("./socketStore")

const otherMember = (participants, userId) => {
    return participants.find((member) => member._id.toString() !== userId.toString())
}

const getSockets = (users = []) => {
    const sockets = users.map((user) => {
        const userId = typeof user === 'string' ? user : user._id;
        const socketId = userSocketIds.get(userId?.toString());
        // console.log(`🧩 Looking for userId: ${userId} → socketId: ${socketId}`);
        return socketId
    }).filter(Boolean)
    return sockets;
}


module.exports = { otherMember, getSockets }