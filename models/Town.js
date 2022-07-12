import mongoose from 'mongoose'
import User from './User'
import Country from './Country'
import Seaport from './Seaport'
import Airport from './Airport'

const townScheme = mongoose.Schema(
  {
    name: { type: String, requited: true },
    cost: { type: Number, requited: true },
    price: { type: Number, requited: true },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Country,
      required: true,
    },
    isSeaport: { type: Boolean, requited: true },
    seaport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Seaport,
      required: true,
    },
    airport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Airport,
      required: true,
    },
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

const Town = mongoose.models.Town || mongoose.model('Town', townScheme)
export default Town
