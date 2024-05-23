const express =  require('express')
const cors = require('cors')
const mongoose  = require('mongoose')
const userRoute = require('./Routes/userRoute')
const chatRoute = require('./Routes/chatRoute')
const messageRoute = require('./Routes/messageRoute')
const chatRoomRoute = require('./Routes/chatRoomRoute')

const app =  express()
require("dotenv").config()
app.use(express.json())
app.use(cors())

app.use('/api/users' , userRoute)
app.use('/api/chats' , chatRoute)
app.use('/api/messages' , messageRoute)
app.use('/api/chatRooms' , chatRoomRoute)

//CRUD

app.get('/', (req,res)=>{
    res.send('welcome our chat app APIs...')
})



const port = process.env.PORT || 5000
const uri = process.env.ATLAS_URI

 

mongoose.connect(uri,{
    
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000 // Zaman aşımını artırdık
    
})
    .then(()=>{
        
        console.log('Veritabanı bağlandı');

        app.listen(port,(req,res)=>{
            console.log(`${port}. port dinleniyor`);
        })
        
    })
    .catch(err=>{
        console.log(err);
    })

