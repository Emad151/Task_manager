const mongoose = require("mongoose")
const validator = require('validator')
const bcrypt = require('bcrypt')// to hash the passwords


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    age:{
        type: Number,
        default:0,
        validate(value){
            if (value < 0) {
                throw new Error('the age cannot be less than 0 !')
            }
        }
        
    },
    email: {
        type: String,
        required:true,
        trim: true,
        lowercase:true,
        validate(value){
            if (! validator.isEmail(value)) {
                throw new Error('invalid email address!')
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minlength:7,
        validate(value){
            if (value.includes('password')) {
                throw new Error('the password cannot PASSWORD word in the password!')
            }
        }
    }
})

userSchema.pre('save', async function(next){
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})
const User = mongoose.model('User', userSchema)

module.exports = User