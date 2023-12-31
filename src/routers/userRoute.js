const {Router} = require('express')
const router = new Router()
const User = require('../db/models/user')
const Task = require('../db/models/task')
const auth = require('../middlewares/auth')
const multer = require('multer') //for file uploading
const sharp = require('sharp') //for image processing




router.post('/users', async(req, res) =>{
    try {
       const user = new User(req.body)
    const token = await user.generateTokenAndSave()
    res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send({error: error.message})
    }
    
})
router.post('/users/login',async(req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateTokenAndSave()
        res.send({user, token})
    } catch (error) {
        res.status(400).send({error: error.message})
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
        res.status(401).send({error: error.message})
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
        res.status(401).send({error: error.message})
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
        res.status(400).send({error: error.message})
    }
    



})
router.delete('/users/me', auth, async(req, res)=>{
    try {
        const user = req.user
        await Task.deleteMany({owner: user._id})
        await User.deleteOne({_id:user._id})
        res.send(`user deleted successfully!`)
    } catch (error) {
        console.log(error);
        res.status(500).send({error: error.message})
    } 
})

const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if (file.originalname.match(/\.(jpg|jpeg|png)$/)) {
           return cb(null, true)
        }
        cb(new Error('only jpg, jpeg and png are accepted file extensions!')) 
    }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async(req, res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send('image uploaded!')
}, (error, req, res, next)=>{
    res.status(400).send({error: error.message})
})
router.delete('/users/me/avatar', auth, async(req,res)=>{
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(400).send({error: error.message})
    }
    
})

// http://localhost:3000/users/me/658edc02bffedc2b5d0daecc/avatar
router.get('/users/me/:id/avatar', async(req, res)=>{
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
        throw new Error()
    }
    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
    
})


module.exports = router