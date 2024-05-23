const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    members: Array
}, {
    timestamps: true
});

const chatRoomModel = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = chatRoomModel;
