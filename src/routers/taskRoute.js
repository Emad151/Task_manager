const {Router} = require('express')
const router = new Router()
const Task = require('../db/models/task')

router.post('/tasks',(req,res)=>{
    const task = new Task(req.body)
    task.save().then(result =>{
        res.status(201).send(result)
    }).catch(error=>{
        res.status(400).send(error)
    })
})
router.get('/tasks', (req,res)=>{
    Task.find({}).then(result=>{
        res.send(result)
    }).catch(error=>{
        res.status(500).send(error)
    })
})
router.get('/tasks/:id',(req,res)=>{
    const _id = req.params.id
    Task.findById(_id).then(result=>{
        if (!result) {
            return red.status(404).send()
        }
        res.status(201).send(result)
    }).catch(error=>{
        res.status(500).send(error)
    })
})
router.patch('/tasks/:id', (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'complete']
    const updatesValid = updates.every(update => allowedUpdates.includes(update))
    if (!updatesValid) {
        return res.status(400).send('invalid updates!')
    }
    Task.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true}).then(task => {
        if (!task) {
            return res.status(404).send('Task not found!')
        }
        res.send(task)
    }).catch(error=>{res.status(500).send(error)})
})
router.delete('/tasks/:id', (req, res)=>{
    Task.findByIdAndDelete(req.params.id).then(task=>{
        if (!task) {
            return res.status(404).send('Task not found!')
        }
        res.send(task)
    }).catch(error=> res.status(500).send(error))
})

module.exports = router