const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: true,
    },
    senderId: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    }
},
{
    timestamps: true
})

const messageModel = mongoose.model('Message', messageSchema)

module.exports = messageModel