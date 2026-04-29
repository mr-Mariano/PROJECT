import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
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
    }
}, { timestamps: true })

accountSchema.index({ user: 1, name: 1 }, { unique: true })

accountSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, copy) => {
        delete copy._id
        delete copy.__v
        return copy
    }
})

export const Account = mongoose.model('Account', accountSchema)