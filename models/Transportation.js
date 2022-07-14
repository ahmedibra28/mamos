import mongoose from 'mongoose'
import User from './User'
import Container from './Container'
import Seaport from './Seaport'
import Airport from './Airport'

const transportationScheme = mongoose.Schema(
  {
    name: { type: String, required: true },
    transportationType: {
      type: String,
      required: true,
      enum: ['track', 'ship', 'train', 'plane'],
    },
    cost: { type: Number, required: true },
    price: { type: Number, required: true },
    cargoType: { type: String, enum: ['FCL', 'LCL', 'AIR'], required: true },
    container: { type: mongoose.Schema.Types.ObjectId, ref: Container },
    departureSeaport: { type: mongoose.Schema.Types.ObjectId, ref: Seaport },
    arrivalSeaport: { type: mongoose.Schema.Types.ObjectId, ref: Seaport },
    departureAirport: { type: mongoose.Schema.Types.ObjectId, ref: Airport },
    arrivalAirport: { type: mongoose.Schema.Types.ObjectId, ref: Airport },
    departureDate: { type: Date, required: true },
    arrivalDate: { type: Date, required: true },

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

const Transportation =
  mongoose.models.Transportation ||
  mongoose.model('Transportation', transportationScheme)
export default Transportation
