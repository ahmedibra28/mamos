import mongoose from 'mongoose'
import User from './User'
import Account from './Account'
import Vendor from './Vendor'
import Transportation from './Transportation'
import Order from './Order'

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
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },
    amount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    description: String,
    transportation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Transportation,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Order,
    },

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
