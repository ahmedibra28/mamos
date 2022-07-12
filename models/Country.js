import mongoose from 'mongoose'
import User from './User'

const countryScheme = mongoose.Schema(
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

const Country =
  mongoose.models.Country || mongoose.model('Country', countryScheme)
export default Country
