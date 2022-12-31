import mongoose from 'mongoose'
import User from './User'

const accountTypeSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
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

const AccountType =
  mongoose.models.AccountType ||
  mongoose.model('AccountType', accountTypeSchema)
export default AccountType
