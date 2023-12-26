const {Router} = require('express')
const router = new Router()
const User = require('../db/models/user')
const { ObjectId } = require('mongodb')
const auth = require('../middlewares/auth')




router.post('/users', async(req, res) =>{
    try {
       const user = new User(req.body)
    const token = await user.generateTokenAndSave()
    res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
    
})
router.post('/users/login',async(req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateTokenAndSave()
        res.send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }
    
})
router.post('/users/logout', auth, async(req, res)=>{
    try {
        const user = req.user
        const myToken = req.token
        user.tokens = user.tokens.filter((token)=> token.token != myToken )
        await user.save()
        res.send('logged Out')
    } catch (error) {
        res.status(401).send()
    }
})

router.post('/users/logoutAll', auth, async(req, res)=>{
    try {
        const user = req.user
        user.tokens = []
        await user.save()
        res.status(200).send('You have logged out of all sessions!')

    } catch (error) {
        res.status(500).send('please authenticate!')
    }

})

router.get('/users/me', auth, (req,res)=>{
    try {
        res.send(req.user)
    } catch (error) {
        res.status(401).send()
    }
})


router.patch('/users/me', auth, async(req,res)=>{
    
    const updates = Object.keys(req.body) //return an array of the keys in the object
    const allowedUpdates = ['name', 'age', 'email', 'password']
    const updatesValid = updates.every(update => allowedUpdates.includes(update))

    if (!updatesValid) {
        return res.status(400).send({error:'invalid Updates!'})
    }


    try {
        const user = req.user
        for (const update of updates) {
            user[update] = req.body[update]
        }
        await user.save()
        
        res.send(user)

    } catch (error) {
        res.status(400).send(error)
    }
    



})
router.delete('/users/me', auth, async(req, res)=>{
    try {
        await User.deleteOne(req.user)
        const {email} = req.body.user
        res.send(user)
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    } 
})


module.exports = router