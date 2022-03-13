import mongoose from 'mongoose'
import User from './User'

const expenseScheme = mongoose.Schema(
  {
    name: String,
    category: String,
    amount: Number,
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

const Expense =
  mongoose.models.Expense || mongoose.model('Expense', expenseScheme)
export default Expense
