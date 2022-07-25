import mongoose from 'mongoose'
import User from './User'
import Town from './Town'
import Country from './Country'
import Seaport from './Seaport'
import Airport from './Airport'
import Transportation from './Transportation'
import Commodity from './Commodity'

const orderScheme = mongoose.Schema(
  {
    buyer: {
      buyerAddress: { type: String, required: true },
      buyerEmail: { type: String, required: true },
      buyerMobileNumber: { type: Number, required: true },
      buyerName: { type: String, required: true },
    },
    pickUp: {
      pickUpTown: { type: mongoose.Schema.Types.ObjectId, ref: Town },
      pickUpWarehouse: String,
      pickUpCity: String,
      pickUpAddress: String,
      pickUpCountry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Country,
        required: true,
      },
      pickUpSeaport: { type: mongoose.Schema.Types.ObjectId, ref: Seaport },
      pickUpAirport: { type: mongoose.Schema.Types.ObjectId, ref: Airport },
    },
    dropOff: {
      dropOffTown: { type: mongoose.Schema.Types.ObjectId, ref: Town },
      dropOffWarehouse: String,
      dropOffCity: String,
      dropOffAddress: String,
      dropOffCountry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Country,
        required: true,
      },
      dropOffSeaport: { type: mongoose.Schema.Types.ObjectId, ref: Seaport },
      dropOffAirport: { type: mongoose.Schema.Types.ObjectId, ref: Airport },
    },
    other: {
      isTemperatureControlled: Boolean,
      isHasInvoice: Boolean,
      importExport: { type: String, required: true },
      transportationType: { type: String, required: true },
      movementType: { type: String, required: true },
      cargoDescription: String,
      cargoType: { type: String, required: true },
      commodity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Commodity,
      },
      noOfPackages: String,
      grossWeight: String,
      invoice: String,
      transportation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Transportation,
      }, // Not available FCL
      containerLCL: [{}], // Not available FCL
      containerFCL: [], // Available only FCL
    },

    trackingNo: { type: String, default: 'waiting' },
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
