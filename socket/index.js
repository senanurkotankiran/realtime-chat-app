const { Server } = require("socket.io");
const messageModel = require("../server/Models/messageModel");

const io = new Server({ cors: "http://localhost:5173" });

let onlineUsers = [];


/*  const BOT_COUNT = 2;
const MESSAGE_INTERVAL = 100; 

let bots = [];
let generalMessages = [];

// Generate random bot names
for (let i = 0; i < BOT_COUNT; i++) {
  bots.push({ id: i, name: `Bot_${i}` });
}

// Simulate bot messages
setInterval(() => {
  const bot = bots[Math.floor(Math.random() * BOT_COUNT)];
  const message = {
    _id: Math.random().toString(36).substr(2, 9),
    senderId: bot.id,
    senderName: bot.name,
    text: `Hello from ${bot.name}`,
    createdAt: new Date()
  };
  generalMessages.push(message);
  io.emit('newMessage', message);
}, MESSAGE_INTERVAL);
 */
 

io.on("connection", (socket) => {
  console.log("new connection", socket.id);
 // socket.emit('initialMessages', generalMessages);


  socket.on("addNewUser", (userId) => {
    if (!onlineUsers.some((user) => user.userId === userId)) {
      onlineUsers.push({
        userId,
        socketId: socket.id,
      });
    }
    console.log("onlineusers", onlineUsers);
    io.emit("getOnlineUsers", onlineUsers);

  });


  // add message
  socket.on("sendMessage",(message)=>{
    const user = onlineUsers.find((user) => user.userId === message.recipientId)
    if(user){
        io.to(user.socketId).emit("getMessage",message)
        io.to(user.socketId).emit("getNotification",{
          senderId: message.senderId,
          isRead: false,
          date:new Date()
        })
    }
  })

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    console.log("onlineusers after disconnect", onlineUsers);
    io.emit("getOnlineUsers", onlineUsers);
  });
});

io.listen(3000);