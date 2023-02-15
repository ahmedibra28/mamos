import mongoose from 'mongoose'
import User from './User'
import Vendor from './Vendor'
import Container from './Container'
import Seaport from './Seaport'
import Country from './Country'
import Commodity from './Commodity'

const transactionSchema = mongoose.Schema(
  {
    date: String,
    account: [String],
    reference: String,
    status: {
      type: String,
      enum: [
        'Active',
        'Pending',
        'Cancelled',
        'Confirmed',
        'Arrived',
        'inActive',
      ],
      default: 'Active',
    },
    description: String,
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Vendor,
    },
    type: {
      type: String,
      enum: [
        'Ship',
        'FCL Booking',
        'Demurrage',
        'Overweight',
        'Payment',
        'Receipt',
      ],
    },
    cargo: { type: String, enum: ['FCL'] },
    container: [
      {
        container: { type: mongoose.Schema.Types.ObjectId, ref: Container },
        cost: String,
        price: String,
      },
    ],
    departureSeaport: { type: mongoose.Schema.Types.ObjectId, ref: Seaport },
    arrivalSeaport: { type: mongoose.Schema.Types.ObjectId, ref: Seaport },
    departureDate: Date,
    arrivalDate: Date,
    storageFreeGateInDate: Date,
    shippingInstructionDate: Date,
    vgmDate: Date,
    delayDate: Date,

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },
    amount: Number,
    discount: Number,

    buyer: {
      buyerName: String,
      buyerAddress: { type: String },
      buyerEmail: { type: String },
      buyerMobileNumber: { type: Number },
    },
    pickUp: {
      // pickUpTown: { type: mongoose.Schema.Types.ObjectId, ref: Town },
      pickUpWarehouse: String,
      pickUpCity: String,
      pickUpAddress: String,
      pickUpCountry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Country,
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
      importExport: String,
      movementType: String,
      cargoDescription: String,
      commodity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Commodity,
      },
      noOfPackages: String,
      grossWeight: String,
      payment: String,
      transportation: String,
      containers: [],
    },
    TrackingNo: { type: String, default: 'N/A' },
    cancelledReason: String,
    Arrived: {
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

const Transaction =
  mongoose.models.Transaction ||
  mongoose.model('Transaction', transactionSchema)
export default Transaction
