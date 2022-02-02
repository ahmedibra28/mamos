import mongoose from 'mongoose'
import Country from './Country'
import Airport from './Airport'
import Seaport from './Country'
import Town from './Country'
import User from './User'
import Commodity from './Commodity'
import Shipper from './Shipper'
import Container from './Container'

const orderScheme = mongoose.Schema(
  {
    buyer: {
      buyerAddress: String,
      buyerEmail: String,
      buyerMobileNumber: Number,
      buyerName: String,
    },
    destination: {
      destAddress: String,
      destCity: String,
      destCountry: { type: mongoose.Schema.Types.ObjectId, ref: Country },
      destPort: { type: mongoose.Schema.Types.ObjectId, ref: Seaport },
      destPostalCode: String,
      destWarehouseName: String,
      dropOffTown: { type: mongoose.Schema.Types.ObjectId, ref: Town },
    },
    pickup: {
      pickUpAddress: String,
      pickUpCity: String,
      pickUpPostalCode: String,
      pickUpTown: { type: mongoose.Schema.Types.ObjectId, ref: Town },
      pickUpWarehouseName: String,
      pickupCountry: { type: mongoose.Schema.Types.ObjectId, ref: Country },
      pickupPort: { type: mongoose.Schema.Types.ObjectId, ref: Seaport },
    },
    invoiceFile: {
      invoiceFileName: String,
      invoiceFilePath: String,
    },
    containers: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: Container },
        quantity: { type: Number },
      },
    ],
    trackingNo: String,
    cargoDescription: String,
    cargoType: String,
    grossWeight: Number,
    importExport: String,
    isHasInvoice: Boolean,
    isTemperatureControlled: Boolean,
    movementType: String,
    noOfPackages: Number,
    transportationType: String,
    commodity: { type: mongoose.Schema.Types.ObjectId, ref: Commodity },
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: Shipper },

    status: { type: String, default: 'Pending' },
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
