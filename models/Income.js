import mongoose from 'mongoose'
import Order from './Order'
import User from './User'

const incomeScheme = mongoose.Schema(
  {
    type: String,
    amount: Number,
    description: String,
    order: { type: mongoose.Schema.Types.ObjectId, ref: Order },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: User },
  },
  { timestamps: true }
)

const Income = mongoose.models.Income || mongoose.model('Income', incomeScheme)
export default Income
