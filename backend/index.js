const express = require('express');
const router  = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const app = express()


app.use(express.json())
app.use("/api/v1",router)
app.use(errorHandler)

app.listen(4000,()=>{
    console.log('server is running on port 4000')
})