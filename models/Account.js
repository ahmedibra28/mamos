import mongoose from 'mongoose'
import User from './User'
import AccountType from './AccountType'

const accountSchema = mongoose.Schema(
  {
    accNo: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    accountType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: AccountType,
      required: true,
    },
    openingBalance: { type: Number, default: 0 },
    description: String,
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

const Account =
  mongoose.models.Account || mongoose.model('Account', accountSchema)
export default Account
