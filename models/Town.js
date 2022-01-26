import mongoose from 'mongoose'
import Seaport from './Seaport'
import Airport from './Airport'
import User from './User'
import Country from './Country'

const townScheme = mongoose.Schema(
  {
    name: { type: String, requited: true },
    cost: { type: Number, requited: true },
    country: { type: mongoose.Schema.Types.ObjectId, ref: Country },
    seaport: { type: mongoose.Schema.Types.ObjectId, ref: Seaport },
    airport: { type: mongoose.Schema.Types.ObjectId, ref: Airport },
    isPort: { type: Boolean, default: false },
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

const Town = mongoose.models.Town || mongoose.model('Town', townScheme)
export default Town
