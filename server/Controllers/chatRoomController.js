const express = require('express');
const router = express.Router();
const chatRoomModel = require('../Models/chatRoomModel');
const message = require('../Models/messageModel');
const user = require('../Models/userModel');

// Genel sohbet odası oluşturma
const createChatRoom = async (req, res) => {
    const newRoom = new chatRoomModel(
        { 
            name: req.body.name, 
            members: req.body.members
        });
    try {
        const savedRoom = await newRoom.save();
        res.status(200).json(savedRoom);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Genel sohbet odası mesajlarını alma
const getChatRoomMessages = async (req, res) => {
    try {
        const messages = await message.find({ chatId: req.params.chatId });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Genel sohbet odasına mesaj gönderme
const createChatRoomMessages =  async (req, res) => {



    
    try {
        const room = await chatRoomModel.findOne({ id: req.params._id });
        if (!room) {
            return res.status(404).json({ error: "General chat room not found" });
        }

        const newMessage = new message({
            chatId: room._id,
            senderId: req.body.senderId,
            text: req.body.text,
        });



        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
   createChatRoom,
   getChatRoomMessages,
   createChatRoomMessages
}
