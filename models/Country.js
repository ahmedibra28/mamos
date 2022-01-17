import mongoose from 'mongoose'
import User from './User'

const countyScheme = mongoose.Schema(
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

const Country =
  mongoose.models.Country || mongoose.model('Country', countyScheme)
export default Country
