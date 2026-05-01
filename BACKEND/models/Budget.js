import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    limit: {
        type: Number,
        required: true,
        min: 0
    }

}, { timestamps: true })

budgetSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, ret) => {
        delete ret._id
        delete ret.__v
        return ret
    }
})

export const Budget = mongoose.model('Budget', budgetSchema)