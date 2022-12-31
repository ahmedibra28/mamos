import mongoose from 'mongoose'
import User from './User'
import Account from './Account'

const transactionSchema = mongoose.Schema(
  {
    date: { type: String, required: true },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Account,
      required: true,
    },
    refId: { type: String, required: true },
    transactionType: {
      type: String,
      required: true,
      enum: ['credit', 'debit'],
    },
    discount: { type: Number, required: true },
    amount: { type: Number, required: true },
    being: { type: String, required: true },
    description: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: User },
  },
  { timestamps: true }
)

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model('Transaction', transactionSchema)
export default Transaction
