const request = require('supertest')
const app =require('../src/app')
const Task = require('../src/db/models/task')
const {
    userOneId,
    userTwoId,
    userOne,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setUpDatabase
} = require('./fixtures/db')



beforeEach(setUpDatabase)

test('should create task', async()=>{
    const response = await request(app)
        .post('/tasks')
        .send({
            "description": "to do a task",
            "complete": false
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(201)
    
    expect(response.body).toMatchObject({
        "description": "to do a task",
        "complete": false
    })
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task).toMatchObject({
        "description": "to do a task",
        "complete": false
    })
    expect(task.owner).toEqual(userOneId)
})
test('should not create task as not authorized', async()=>{
    await request(app)
        .post('/tasks')
        .send({
            "description": "to do a task",
            "complete": false
        })
        .set('Authorization', `Bearer `)
        .expect(401)
})
test('should create task and ignores the invalid fields', async()=>{
    const response = await request(app)
        .post('/tasks')
        .send({
            "description": "to do a task",
            "wrongEntry": false //wrong entry
        })
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task).toMatchObject({
         "description": "to do a task",
         "complete": false
        })
    expect(task.owner).toEqual(userOneId)
})
test('should not create task as no description provided', async()=>{
    await request(app)
        .post('/tasks')
        .send() //not sending the object that having the "required" description
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(400)
})
test('should get all my tasks', async()=>{
    const tasks = await request(app)
                    .get('/tasks')
                    .send()
                    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                    .expect(200)
    expect(tasks.body.length).toBe(2)
})
test('Should get a page of tasks', async()=>{
    const response = await request(app)
        .get('/tasks?limit=1')
        .send()
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200)
    expect(response.body.length).toBe(1)
})
test('Should get only completed tasks', async() => { 
    const response = await request(app)
        .get('/tasks?complete=true')
        .send()
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200)
    for (const task of response.body) {
        expect(task.complete).toEqual(true)
    }
 })
 test('should get sorted tasks by createdAt:asc', async() => { 
    const response = await request(app)
        .get('/tasks?sortedBy=createdAt:asc')
        .send()
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200)
    let previous = response.body[0]
    for (let i =1; i<response.body.length; i++) {
        expect(new Date(response.body[i].createdAt).getTime()).toBeGreaterThanOrEqual(new Date(previous.createdAt).getTime())
        previous = response.body[i]
    }
  })
test('should not delete other users tasks', async()=>{
    await request(app)
        .delete(`/task/${taskOne._id}`)
        .send()
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .expect(404)
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})



//
// Task Test Ideas
//
// Should not create task with invalid description/completed
// Should not update task with invalid description/completed
// Should delete user task
// Should not delete task if unauthenticated
// Should not update other users task
// Should fetch user task by id
// Should not fetch user task by id if unauthenticated
// Should not fetch other users task by id
// Should sort tasks by description/completed/createdAt/updatedAt
