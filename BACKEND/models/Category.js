import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 2
    },
    icon: {
        type: String,
        required: true,
        enum: ['💰', '🍔', '🧾', '🏥', '🚗', '🎬', '🏠', '🎓', '🛒', '✈️']
    }
}, { timestamps: true })


categorySchema.index({ user: 1, name: 1 }, { unique: true })

categorySchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, copy) => {
        delete copy._id
        delete copy.__v
        return copy
    }
})

export const Category = mongoose.model('Category', categorySchema)