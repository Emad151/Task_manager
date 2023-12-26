const {Router} = require('express')
const router = new Router()
const User = require('../db/models/user')
const { ObjectId } = require('mongodb')




router.post('/users', (req, res) =>{
    const user = new User(req.body)
    user.save().then(result => {
        res.status(201).send(result)
    }).catch(error => {
        res.status(400).send(error)
    })
})
router.get('/users', (req,res)=>{
    User.find({}).then((users)=>{
        res.send(users)
    }).catch((error=>{
        res.status(500).send(error)
    }))
})

router.get('/users/:id',(req,res)=>{
    User.findOne({_id: new ObjectId(req.params.id)}).then((result=>{
        if (!result) {
            return res.status(404).send()
        }
        res.send(result)
    })).catch(error=>{
        res.status(500).send(error)
    })
})
router.patch('/users/:id', async(req,res)=>{

    const updates = Object.keys(req.body) //return an array of the keys in the object
    const allowedUpdates = ['name', 'age', 'email', 'password']
    const updatesValid = updates.every(update => allowedUpdates.includes(update))

    if (!updatesValid) {
        return res.status(400).send({error:'invalid Updates!'})
    }

    //The option "new: true" in the "findByIdAndUpdate" function makes it 
    // return the new updated user instead of the default old 
    // User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true}).then(user=>{
    //     if (!user) {
    //         return res.status(404).send('user not found!')
    //     }
    //     res.send(user)
    // }).catch(e=>{res.status(500).send(e)})
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).send('user not found!')
        }
        for (const update of updates) {
            user[update] = req.body[update]
        }
        await user.save()
        res.send(user)

    } catch (error) {
        res.status(400).send(error)
    }
    



})
router.delete('/users/:id', (req, res)=>{
    User.findByIdAndDelete(req.params.id).then(user=>{
        if (!user) {
            return res.status(404).send('user not found!')
        }
        res.send(user)
    }).catch(error=>res.status(500).send(error))
})


module.exports = router