const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt =require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Timestamp } = require('mongodb');

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if( ! validator.isEmail(value)){
                throw new Error('Email is Invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
},{
    Timestamp:true
})

userSchema.virtual('tasks' , {
    ref: 'Task' ,
    localField : '_id' ,
    foreignField : 'owner'
})

userSchema.methods.toJSON = function(){
    const user = this;
    const userback = user.toObject();

    delete userback.password;
    delete userback.tokens;

    return userback
}

userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({token});

    await user.save();

    return token
}

userSchema.statics.findRegisterduser = async(email,password)=>{
    const user = await User.findOne({email})

    if(!user){
        throw new Error('Unable To Login')
    }
    const isMatch = await bcrypt.compare(password , user.password)

    if(!isMatch){
        throw new Error('UNable to Login')
    }

    return user
}

const User = mongoose.model('User',userSchema);
module.exports = User ;