import mongoose from 'mongoose'
import User from './User'

const tradeScheme = mongoose.Schema(
  {
    files: [],
    description: String,
    status: { type: String, default: 'pending' },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: User },
  },
  { timestamps: true }
)

const Trade = mongoose.models.Trade || mongoose.model('Trade', tradeScheme)
export default Trade
