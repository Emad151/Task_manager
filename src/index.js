const express = require('express')
const app = express()
const port = process.env.PORT 

const userRouter = require('./routers/userRoute')
const taskRouter = require('./routers/taskRoute')
require('./db/mongoose')

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port, () => console.log(`Example app listening on port ${port}!`))