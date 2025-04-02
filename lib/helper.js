const { userSocketIds } = require("../server")

const otherMember = (participants, userId) => {
    return participants.find((member) => member._id.toString() !== userId.toString())
}

const getSockets = (users = []) => {
    const sockets = users.map((user) => userSocketIds.get(user._id.toString()))
    return sockets;
}


module.exports = { otherMember, getSockets }