const express = require('express');
const router  = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const mongoose = require('mongoose');
const app = express()
require('dotenv').config()



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
app.use(errorHandler)

app.listen(4000,()=>{
    console.log('server is running on port 4000')
})