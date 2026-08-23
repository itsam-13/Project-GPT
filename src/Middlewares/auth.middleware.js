const userModel = require('../models/user.model')

const jwt = require('jsonwebtoken')

async function authUser(req,res,next){
    try {
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({message:"Unauthorized"})
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        const user = await userModel.findById(decoded.id)

        if(!user){
            return res.status(401).json({message:"Unauthorized"})
        }

        req.user = user

        next()


    } catch (error) {
        console.error(error)
        return res.status(500).json({message:"Internal server error"})
    }
}

modules.exports = {authUser};