import mongoose from 'mongoose'
import User from './User'

const employeeScheme = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobile: { type: String, required: true },
    address: { type: String, required: true },
    salary: { type: Number, required: true },
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

const Employee =
  mongoose.models.Employee || mongoose.model('Employee', employeeScheme)
export default Employee
