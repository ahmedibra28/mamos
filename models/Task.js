import mongoose from 'mongoose'
import User from './User'

const taskScheme = mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['completed', 'pending'],
      default: 'pending',
    },
    task: { type: String, required: true },
    response: { type: String },
    employee: { type: mongoose.Types.ObjectId, ref: User, required: true },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: User },
  },
  { timestamps: true }
)

const Task = mongoose.models.Task || mongoose.model('Task', taskScheme)
export default Task
