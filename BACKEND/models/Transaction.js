import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title:   { type: String, required: true },
    amount:  { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    account:  { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
    date: { type: Date, default: Date.now }
}, { timestamps: true })

transactionSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc, copy) => {
        copy.id = copy._id.toString()
        delete copy._id
        delete copy.__v
        return copy
    }
})
export const Transaction =  mongoose.model('Transaction', transactionSchema)