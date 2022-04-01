import mongoose from 'mongoose'
import Order from './Order'
import User from './User'

const deliveryModeScheme = mongoose.Schema(
  {
    name: String,
    mobile: Number,
    email: String,
    address: String,
    mode: String,
    order: { type: mongoose.Schema.Types.ObjectId, ref: Order },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: User },
  },
  { timestamps: true }
)

const DeliveryMode =
  mongoose.models.DeliveryMode ||
  mongoose.model('DeliveryMode', deliveryModeScheme)
export default DeliveryMode
