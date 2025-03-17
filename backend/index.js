const express = require('express');
const router  = require('./routes');
const http = require('http');
const errorHandler = require('./middleware/errorHandler');
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const socketHandler = require('./utils/socketHandler');
const app = express()
require('dotenv').config()

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000", // Adjust to your frontend URL
        methods: ["GET", "POST","PUT","DELETE"]
    }
});

async function connectDB() {
    try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
    console.log("DB connected successfully");
    } catch (error) {
        console.log(error);
    }
}
connectDB()



app.use(express.json())
app.use("/api/v1",router)

socketHandler(io)

app.use(errorHandler)

app.listen(4000,()=>{
    console.log('server is running on port 4000')
})