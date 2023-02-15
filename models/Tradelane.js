import mongoose from 'mongoose'
import User from './User'
import Transaction from './Transaction'

const tradelaneScheme = mongoose.Schema(
  {
    transportation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Transaction,
      required: true,
    },
    tradelane: [
      {
        dateTime: { type: Date, required: true },
        actionType: { type: String, required: true },
        tradeType: {
          type: String,
          required: true,
          enum: ['Track', 'Ship', 'Train', 'Plane'],
        },
        location: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['Active', 'inActive', 'Cancelled'],
      default: 'Active',
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

const Tradelane =
  mongoose.models.Tradelane || mongoose.model('Tradelane', tradelaneScheme)
export default Tradelane
