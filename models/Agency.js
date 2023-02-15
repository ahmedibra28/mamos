import mongoose from 'mongoose'
import User from './User'

const agencyScheme = mongoose.Schema(
  {
    name: { type: String, required: true },
    contactPerson: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    status: { type: String, enum: ['Active', 'inActive'], default: 'Active' },

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
