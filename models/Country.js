import mongoose from 'mongoose'
import User from './User'

const countryScheme = mongoose.Schema(
  {
    name: { type: String, required: true },
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

const Country =
  mongoose.models.Country || mongoose.model('Country', countryScheme)
export default Country
