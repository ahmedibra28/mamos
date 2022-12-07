import mongoose from 'mongoose'
import User from './User'
import Transportation from './Transportation'

const tradelaneScheme = mongoose.Schema(
  {
    transportation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Transportation,
      required: true,
    },
    tradelane: [
      {
        dateTime: { type: Date, required: true },
        actionType: { type: String, required: true },
        tradeType: {
          type: String,
          required: true,
          enum: ['track', 'ship', 'train', 'plane'],
        },
        location: { type: String, required: true },
      },
    ],
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

const Tradelane =
  mongoose.models.Tradelane || mongoose.model('Tradelane', tradelaneScheme)
export default Tradelane
