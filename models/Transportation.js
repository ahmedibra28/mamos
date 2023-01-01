import mongoose from 'mongoose'
import User from './User'
import Container from './Container'
import Seaport from './Seaport'
import Vendor from './Vendor'

const transportationScheme = mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Vendor,
      required: true,
    },
    reference: { type: String, required: true, uppercase: true },
    transportationType: {
      type: String,
      required: true,
      enum: ['ship'],
    },
    cargoType: { type: String, enum: ['FCL'], required: true },
    container: [
      {
        container: { type: mongoose.Schema.Types.ObjectId, ref: Container },
        cost: String,
        price: String,
      },
    ],
    departureSeaport: { type: mongoose.Schema.Types.ObjectId, ref: Seaport },
    arrivalSeaport: { type: mongoose.Schema.Types.ObjectId, ref: Seaport },
    departureDate: { type: Date, required: true },
    arrivalDate: { type: Date, required: true },
    storageFreeGateInDate: { type: Date, required: true },
    shippingInstructionDate: { type: Date, required: true },
    vgmDate: { type: Date, required: true },
    delayDate: { type: Date },

    status: {
      type: String,
      enum: ['active', 'inactive', 'confirmed', 'arrived'],
      default: 'active',
    },

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
