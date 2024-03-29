import mongoose from 'mongoose'
import User from './User'

const vendorSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    address: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['Ship', 'Track', 'Government', 'Customer'],
    },
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

const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema)
export default Vendor
