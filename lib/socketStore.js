const userSocketIds = new Map();

function addSocket(userId, socketId) {
    const sockets = userSocketIds.get(userId) || new Set();
    sockets.add(socketId);
    userSocketIds.set(userId, sockets);
}

function removeSocket(userId, socketId) {
    const sockets = userSocketIds.get(userId);
    if (sockets) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
            userSocketIds.delete(userId);
        } else {
            userSocketIds.set(userId, sockets);
        }
    }
}

function getSocketIds(userId) {
    return Array.from(userSocketIds.get(userId) || []);
}
module.exports = { userSocketIds, addSocket, removeSocket, getSocketIds };
