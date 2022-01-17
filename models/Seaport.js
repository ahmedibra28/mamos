import mongoose from 'mongoose'
import Country from './Country'
import User from './User'

const seaportScheme = mongoose.Schema(
  {
    name: { type: String, requited: true },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Country,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: User },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const Seaport =
  mongoose.models.Seaport || mongoose.model('Seaport', seaportScheme)
export default Seaport
