import mongoose from 'mongoose'
import User from './User'

const agencyScheme = mongoose.Schema(
  {
    name: { type: String, required: true },
    contactPerson: { type: String, required: true },
    mobile: { type: Number, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
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

const Agency = mongoose.models.Agency || mongoose.model('Agency', agencyScheme)
export default Agency
