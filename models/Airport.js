import mongoose from 'mongoose'
import Country from './Country'
import User from './User'

const airportScheme = mongoose.Schema(
  {
    name: { type: String, requited: true },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Country,
      required: true,
    },
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

const Airport =
  mongoose.models.Airport || mongoose.model('Airport', airportScheme)
export default Airport
