import mongoose from 'mongoose'
import User from './User'
// import Town from './Town'
import Country from './Country'
import Seaport from './Seaport'
import Transportation from './Transportation'
import Commodity from './Commodity'
import Vendor from './Vendor'

const orderScheme = mongoose.Schema(
  {
    buyer: {
      buyerName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Vendor,
        required: true,
      },
      buyerAddress: { type: String },
      buyerEmail: { type: String },
      buyerMobileNumber: { type: Number },
      // buyerName: { type: String },
    },
    pickUp: {
      // pickUpTown: { type: mongoose.Schema.Types.ObjectId, ref: Town },
      pickUpWarehouse: String,
      pickUpCity: String,
      pickUpAddress: String,
      pickUpCountry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Country,
        required: true,
      },
      pickUpSeaport: { type: mongoose.Schema.Types.ObjectId, ref: Seaport },
      pickUpCost: Number,
      pickUpPrice: Number,
      pickUpVendor: { type: mongoose.Schema.Types.ObjectId, ref: Vendor },
      pickUpCustomClearance: {
        amount: { type: Number, default: 0 },
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: Vendor,
        },
      },
    },
    dropOff: {
      // dropOffTown: { type: mongoose.Schema.Types.ObjectId, ref: Town },
      dropOffWarehouse: String,
      dropOffCity: String,
      dropOffAddress: String,
      dropOffCountry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Country,
        required: true,
      },
      dropOffSeaport: { type: mongoose.Schema.Types.ObjectId, ref: Seaport },
      dropOffCost: Number,
      dropOffPrice: Number,
      dropOffVendor: { type: mongoose.Schema.Types.ObjectId, ref: Vendor },
      dropOffCustomClearance: {
        amount: { type: Number, default: 0 },
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: Vendor,
        },
      },
    },
    other: {
      isTemperatureControlled: Boolean,
      // isHasInvoice: Boolean,
      importExport: { type: String, required: true },
      movementType: { type: String, required: true },
      cargoDescription: String,
      commodity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Commodity,
      },
      noOfPackages: String,
      grossWeight: String,
      // invoice: String,
      payment: String,
      transportation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Transportation,
      }, // shipment reference
      containers: [], // selected shipments
    },

    trackingNo: { type: String, default: 'N/A' },
    cancelledReason: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'arrived'],
      default: 'pending',
    },
    arrived: {
      status: String,
      description: String,
    },
    process: {
      loadingOnTrack: { type: Boolean, default: false },
      containerInPort: { type: Boolean, default: false },
      checkingVGM: { type: Boolean, default: false },
      instructionForShipments: { type: Boolean, default: false },
      clearanceCertificate: { type: Boolean, default: false },
      paymentDetails: { type: Boolean, default: false },
    },
    demurrage: { type: Number, default: 0 },

    overWeight: {
      amount: { type: Number, default: 0 },
      vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Vendor,
      },
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
