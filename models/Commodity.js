import mongoose from 'mongoose'
import User from './User'

const commodityScheme = mongoose.Schema(
  {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: User },
  },
  { timestamps: true }
)

const Commodity =
  mongoose.models.Commodity || mongoose.model('Commodity', commodityScheme)
export default Commodity
