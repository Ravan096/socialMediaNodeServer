const emitEvent = (req, event, users, data) => {
    console.log("event", event, data)
}

module.exports = { emitEvent }