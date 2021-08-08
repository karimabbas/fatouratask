const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async(req , re, next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded =jwt.verify(token ,process.env.JWT_SECRET);
        const user = await User.findOne({
            _id:decoded._id ,
            'tokens.token':token
        })

        if( ! user){
            throw new Error()
        }

        req.user = user
        
    }
    catch(e){
        res.status(401).send({
            error:'please Authenticate'
        })
    }
}

module.exports =auth