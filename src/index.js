const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const userRouter = require('./routers/userRoute')
const taskRouter = require('./routers/taskRoute')
require('./db/mongoose')

//Maintenance mode middleware
// app.use((req, res, next)=>{
//     res.status(503).send('the website is temporarily unavailable!')
// })
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port, () => console.log(`Example app listening on port ${port}!`))