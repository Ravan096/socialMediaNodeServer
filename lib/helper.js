const otherMember = (participants, userId) => {
    return participants.find((member) => member._id.toString() !== userId.toString())
}


module.exports = { otherMember }