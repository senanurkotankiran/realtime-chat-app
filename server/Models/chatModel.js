const mongoose = require("mongoose")
const chatShema = new mongoose.Schema({
    members: Array,
},{
    timestamps: true,
})

const chatModel = mongoose.model('Chat', chatShema)
module.exports = chatModel