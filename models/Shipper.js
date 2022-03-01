import mongoose from 'mongoose'
import User from './User'
import Seaport from './Seaport'
import Airport from './Airport'
import Container from './Container'

const shipperScheme = mongoose.Schema(
  {
    name: { type: String },
    transportationType: { type: String },
    price: { type: Number },
    cargoType: { type: String },
    movementType: { type: String },
    departureSeaport: { type: mongoose.Schema.Types.ObjectId, ref: Seaport },
    arrivalSeaport: { type: mongoose.Schema.Types.ObjectId, ref: Seaport },
    departureAirport: { type: mongoose.Schema.Types.ObjectId, ref: Airport },
    arrivalAirport: { type: mongoose.Schema.Types.ObjectId, ref: Airport },
    container: { type: mongoose.Schema.Types.ObjectId, ref: Container },
    availableCapacity: Number,
    departureDate: { type: Date },
    arrivalDate: { type: Date },
    tradelane: [
      {
        dateTime: { type: Date },
        actionType: { type: String },
        tradeType: { type: String },
        location: { type: String },
        description: { type: String },
        isActiveLocation: { type: Boolean, default: false },
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
