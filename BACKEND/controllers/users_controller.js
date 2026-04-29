import { User } from '../models/User.js'
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'

const salt = Number(process.env.SALT_ROUNDS) || 10

const generate_token = (user_id) => {
    return jwt.sign(
        { user_id: user_id },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    )
}

export const login_user = async(req, res) => {
    const { email , password } = req.body

    try{
        const user = await User.findOne({ email }).select('+password')
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" })

        }

        const token = generate_token(user._id)
        return res.status(200).json({
            message : "Login Successfully",
            user_id : user._id.toString(),
            token : token
        })
    }catch(err){
        return res.status(500).json({ message : "Internal Server Error"})
    }
}

export const create_user = async (req, res) => {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" })
    }

    try {
        const hashed_password = await bcrypt.hash(password, salt)

        const user = await User.create({
            name,
            email,
            password: hashed_password
        })

        return res.status(201).json({
            message: "User Created Successfully",
            user_id: user._id.toString(),
            token: generate_token(user._id)
        })

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Email already exists" })
        }

        return res.status(500).json({ message: "Internal Server Error" })
    }
}

export const update_user = async (req, res) => {
    const { name, email, password } = req.body
    const updateData = {}

    if (name) updateData.name = name
    if (email) updateData.email = email

    try {
        if (email) {
            const exists = await User.findOne({
                email,
                _id: { $ne: req.user._id }
            })

            if (exists) {
                return res.status(400).json({ message: "Email already in use" })
            }
        }

        if (password) {
            updateData.password = await bcrypt.hash(password, salt)
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No fields to update" })
        }

        const updated_user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        )

        return res.status(200).json({ user: updated_user })

    } catch (err) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

export const delete_user = async(req, res) => {
    try{
        const user_deleted = await User.findByIdAndDelete(req.user._id)
        if(!user_deleted){ return res.status(404).json({ message : "User not found"})}
        return res.status(200).json({ message : "User Deleted" })
    }catch(err){
        return res.status(500).json({ message : "Internal Server Error" })
    }
}