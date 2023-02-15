import mongoose from 'mongoose'
import User from './User'
import Country from './Country'
import Seaport from './Seaport'

const townScheme = mongoose.Schema(
  {
    name: { type: String, required: true },
    cost: { type: Number, required: true },
    price: { type: Number, required: true },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Country,
      required: true,
    },
    seaport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Seaport,
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

const Town = mongoose.models.Town || mongoose.model('Town', townScheme)
export default Town
