const express =  require('express')
const router = express.Router()
const {createChatRoom,getChatRoomMessages,createChatRoomMessages} = require('../Controllers/chatRoomController')
const { route } = require('./messageRoute')

router.post('/createChatRoom',createChatRoom)
router.get('/messages/:chatId', getChatRoomMessages)
router.post('/messages/:chatRoomId', createChatRoomMessages)

module.exports = router