const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require("../../src/db/models/user")
const Task = require('../../src/db/models/task')



const userOneId = new mongoose.Types.ObjectId()

const userOne = {
    _id: userOneId,
    name:'emad',
    age:25,
    email:'emad@example.com',
    password:'123456789',
    tokens:[
        {token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)}
    ]
}

const userTwoId = new mongoose.Types.ObjectId()

const userTwo = {
    _id: userTwoId,
    name:'ramy',
    age:25,
    email:'ramy@example.com',
    password:'123456789',
    tokens:[
        {token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET)}
    ]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'first task',
    complete: true,
    owner: userOne._id
}
const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'second task',
    complete: false,
    owner: userOne._id
}
const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'third task',
    complete: true,
    owner: userTwo._id
}
const setUpDatabase = async()=>{
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()

    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}
module.exports = {
    userOneId,
    userTwoId,
    userOne,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setUpDatabase
}