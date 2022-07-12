import mongoose from 'mongoose'
import User from './User'

const commodityScheme = mongoose.Schema(
  {
    name: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

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
