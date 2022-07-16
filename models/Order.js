import mongoose from 'mongoose'
import User from './User'
import Town from './Town'
import Country from './Country'
import Seaport from './Seaport'
import Airport from './Airport'

const orderScheme = mongoose.Schema(
  {
    buyer: {
      buyerAddress: String,
      buyerEmail: String,
      buyerMobileNumber: Number,
      buyerName: String,
    },
    pickUp: {
      pickUpTown: { type: mongoose.Schema.Types.ObjectId, ref: Town },
      pickUpWarehouse: String,
      pickUpCity: String,
      pickUpAddress: String,
      pickUpCountry: { type: mongoose.Schema.Types.ObjectId, ref: Country },
      pickUpSeaport: { type: mongoose.Schema.Types.ObjectId, ref: Seaport },
      pickUpAirport: { type: mongoose.Schema.Types.ObjectId, ref: Airport },
    },
    dropOff: {
      dropOffTown: { type: mongoose.Schema.Types.ObjectId, ref: Town },
      dropOffWarehouse: String,
      dropOffCity: String,
      dropOffAddress: String,
      dropOffCountry: { type: mongoose.Schema.Types.ObjectId, ref: Country },
      dropOffSeaport: { type: mongoose.Schema.Types.ObjectId, ref: Seaport },
      dropOffAirport: { type: mongoose.Schema.Types.ObjectId, ref: Airport },
    },
    other: {
      isTemperatureControlled: Boolean,
      isHasInvoice: Boolean,
      importExport: String,
      transportationType: String,
      movementType: String,
      cargoDescription: String,
      cargoType: String,
      commodity: String,
      noOfPackages: String,
      grossWeight: String,
      invoice: String,
      transportation: {}, // Not available FCL
      containerLCL: [{}], // Not available FCL
      containerFCL: [], // Available only FCL
    },

    trackingNo: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'deleted'],
      default: 'pending',
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

const Order = mongoose.models.Order || mongoose.model('Order', orderScheme)
export default Order
