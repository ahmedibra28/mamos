import mongoose from 'mongoose'
import User from './User'
import Account from './Account'
import Vendor from './Vendor'

const transactionSchema = mongoose.Schema(
  {
    date: { type: String, required: true },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Account,
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Vendor,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    amount: { type: Number, required: true },
    discount: { type: Number, required: true },
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
