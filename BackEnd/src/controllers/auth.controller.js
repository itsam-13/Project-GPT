const userModel = require('../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


async function registerUser(req, res) {
    const { email, fullName: {firstName , lastName} , password } = req.body;

    const isUserAlreadyExist = await userModel.findOne({ email })

    if (isUserAlreadyExist) {
        return res.status(400).json({ message: "User already exists" })
    }


    const hashPassword = await bcrypt.hash(password, 10)


    const user = await userModel.create({
        fullname: {
            firstName,
            lastName
        },
        email,
        password: hashPassword
    })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

    res.cookie("token", token)

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
            email: user.email,
            _id: user._id,
            fullName: user.fullName
        }
    })

}

async function loginUser(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" })
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

    res.cookie("token", token)

    res.status(200).json({
        success: true,
        message: "User logged in successfully",
        user: {
            email: user.email,
            _id: user._id,
            fullName: user.fullName
        }
    })

}

module.exports = { registerUser, loginUser }