import mongoose from 'mongoose'
import User from './User'

const containerScheme = mongoose.Schema(
  {
    name: { type: String, required: true },
    height: { type: Number, required: true },
    width: { type: Number, required: true },
    length: { type: Number, required: true },

    payloadCapacity: { type: Number, required: true },
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

const Container =
  mongoose.models.Container || mongoose.model('Container', containerScheme)
export default Container
