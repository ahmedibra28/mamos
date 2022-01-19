import mongoose from 'mongoose'
import User from './User'

const agencyScheme = mongoose.Schema(
  {
    name: { type: String, requited: true },
    mobile: { type: Number, requited: true },
    email: { type: String, requited: true, unique: true, lowercase: true },
    city: { type: String, requited: true },
    address: { type: String, requited: true },

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

const Agency = mongoose.models.Agency || mongoose.model('Agency', agencyScheme)
export default Agency
