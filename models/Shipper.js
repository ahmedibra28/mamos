import mongoose from 'mongoose'
import User from './User'
import Seaport from './Seaport'

const shipperScheme = mongoose.Schema(
  {
    name: { type: String, required: true },
    transportationType: { type: String, required: true },
    price: { type: Number, required: true },
    cargoType: { type: String, required: true },
    movementType: { type: String, required: true },
    departureSeaport: { type: mongoose.Schema.Types.ObjectId, ref: Seaport },
    arrivalSeaport: { type: mongoose.Schema.Types.ObjectId, ref: Seaport },
    departureDate: { type: Date, required: true },
    arrivalDate: { type: Date, required: true },
    tradelane: [
      {
        dateTime: { type: Date },
        actionType: { type: String },
        tradeType: { type: String },
        location: { type: String },
        description: { type: String },
      },
    ],
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

const Shipper =
  mongoose.models.Shipper || mongoose.model('Shipper', shipperScheme)
export default Shipper
