const {Router} = require('express')
const { ObjectId } = require('mongodb')
const router = new Router()
const Task = require('../db/models/task')
const auth = require('../middlewares/auth')

router.post('/tasks',auth ,(req,res)=>{
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    task.save().then(result =>{
        res.status(201).send(result)
    }).catch(error=>{
        res.status(400).send({error: error.message})
    })
})
router.get('/tasks', auth, async(req,res)=>{
    try {
        const user = req.user
        await user.populate('tasks')
    if (user.tasks.length == 0) {
        return res.status(404).send('you have no tasks to do!')
    }
    res.send(user.tasks)   
    } catch (error) {
        res.status(400).send({error: error.message})
    }
})
router.get('/tasks/:id',auth ,(req,res)=>{
    const _id = req.params.id
    Task.findOne({_id, owner: req.user._id}).then(result=>{
        if (!result) {
            return res.status(404).send()
        }
        res.send(result)
    }).catch(error=>{
        console.log(error);
        res.status(500).send({error: error.message})
    })
})
router.patch('/tasks/:id',auth, async(req,res)=>{
    try {
        const updates = Object.keys(req.body)
        const allowedUpdates = ['description', 'complete']
        const updatesValid = updates.every(update => allowedUpdates.includes(update))
        if (!updatesValid) {
        return res.status(400).send('invalid updates!')
        } 
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if (!task) {
            return res.status(404).send('task not found!')
        }
        //updating the task properties
        for (const update of updates) {
            task[update] = req.body[update]
        }
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(500).send({error: error.message})
    }
    
})
router.delete('/tasks/:id', auth, async(req, res)=>{
    try {
       const result = await Task.deleteOne({_id: req.params.id, owner: req.user._id})

    if (result.deletedCount == 0) {return res.status(404).send('task not found!')}

    res.send(result) 
    } catch (error) {
        console.log(error)
        res.status(400).send({error: error.message})
    }
    
})

module.exports = router