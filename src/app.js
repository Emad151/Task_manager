const express = require('express')
const userRouter = require('./routers/userRoute')
const taskRouter = require('./routers/taskRoute')


const app = express()
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
require('./db/mongoose')

module.exports = app