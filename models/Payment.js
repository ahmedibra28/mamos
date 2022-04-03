import mongoose from 'mongoose'
import Order from './Order'
import User from './User'

const paymentScheme = mongoose.Schema(
  {
    paymentMethod: String,
    amount: Number,
    payments: [
      {
        date: { type: Date, default: Date.now },
        amount: Number,
      },
    ],
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

const Payment =
  mongoose.models.Payment || mongoose.model('Payment', paymentScheme)
export default Payment
