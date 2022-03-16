import mongoose from 'mongoose'
import Order from './Order'
import Shipper from './Shipper'
import Town from './Town'
import User from './User'

const expenseScheme = mongoose.Schema(
  {
    type: String,
    amount: Number,
    description: String,
    order: { type: mongoose.Schema.Types.ObjectId, ref: Order },
    shipper: { type: mongoose.Schema.Types.ObjectId, ref: Shipper },
    town: { type: mongoose.Schema.Types.ObjectId, ref: Town },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: User },
  },
  { timestamps: true }
)

const Expense =
  mongoose.models.Expense || mongoose.model('Expense', expenseScheme)
export default Expense
