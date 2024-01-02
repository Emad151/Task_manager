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

/**
 * GET /tasks?complete=true
 * GET /tasks?limit=2&skip=0
 * GET /tasks?sortedBy=createdAt:desc
 */
router.get('/tasks', auth, async(req,res)=>{
    try {
        const user = req.user
        let match = {}
        let sort = {}
        if (req.query.complete) {
            match.complete = req.query.complete === 'true'
        }
        if (req.query.sortedBy) {
            const parts = req.query.sortedBy.split(':')
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        }
        await user.populate({
            path: 'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit), //if 'limit' is undefined, 'parseInt' will return NaN so it won't provide a limit, it won't cause a problem 
                skip: parseInt(req.query.skip),
                sort // 1 for ascending, -1 for descending  e.g: {createdAt: -1}
            }
        })
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