const jwt = require("jsonwebtoken")
const { default: mongoose } = require("mongoose")
const request = require("supertest")
const app = require('../src/app')
const { findById } = require("../src/db/models/user")
const User = require("../src/db/models/user")


const userOneId = new mongoose.Types.ObjectId()
//user to save in the database before each test case
userOne = {
    _id: userOneId,
    name:'emad',
    age:25,
    email:'emad@example.com',
    password:'123456789',
    tokens:[
        {token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)}
    ]
}

beforeEach(async()=>{
    await User.deleteMany()
    await new User(userOne).save()
})


test('should create new user', async() => { 
    const response = await request(app).post('/users').send({
        name:'emad',
        email:'example@example.com',
        password:'passwor11!!'
    }).expect(201)

    //assert that user has been created in the database
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //assertion about the response
    expect(response.body).toMatchObject({
       user:{ name:'emad',
        email:'example@example.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('passwor11!!')
 })

test('should login', async() => { 
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
    const user = await User.findById(response.body.user._id)
    expect(response.body.token).toBe(user.tokens[1].token)

  })

test('should not login as non-existent user', async() => { 
    await request(app).post('/users/login').send({
        email:'emad@example.com',
        password:'1234567890'
    }).expect(400)
   })
test('should get user profile', async()=>{
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
   })
test('should not login as not authenticated user', async()=>{
    await request(app)
        .get('/users/me')
        .set('Authorization', '')
        .send()
        .expect(401)
   })
test('should delete user account', async()=>{
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findOne({_id: userOne._id})
    expect(user).toBeNull()
   })
test('should NOT delete account as not authenticated', async()=>{
    await request(app)
    .delete('/users/me')
    .set('Authorization', '')
    .send()
    .expect(401)
})
test('should update valid user fields', async()=>{
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'omda',
            age:26
        }).expect(200)
    const user = await User.findById(userOneId)
    expect(user).toMatchObject({
        name: 'omda',
        age: 26
    })
    expect(response.body).toMatchObject({
        name: 'omda',
        age: 26
    })
})
test('should not update invalid user fields',async()=>{
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name:'omda',
            height: 25
        })
    expect(400)
})
test('should upload avatar',async()=>{
     await request(app)
         .post('/users/me/avatar')
         .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
         .send()
         .attach('avatar', 'tests/fixtures/me.jpeg')
         .expect(200)           

    const user = await User.findById(userOneId)
    expect(Buffer.isBuffer(user.avatar)).toBe(true)
})