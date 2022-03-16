import mongoose from 'mongoose'
import Order from './Order'
import Town from './Town'
import User from './User'

const incomeScheme = mongoose.Schema(
  {
    type: String,
    amount: Number,
    description: String,
    order: { type: mongoose.Schema.Types.ObjectId, ref: Order },
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

const Income = mongoose.models.Income || mongoose.model('Income', incomeScheme)
export default Income
