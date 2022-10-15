import mongoose from 'mongoose'

const noticeScheme = mongoose.Schema(
  {
    description: { type: String, required: true },
    status: { type: String, required: true, default: 'inactive' },
  },
  { timestamps: true }
)

const Notice = mongoose.models.Notice || mongoose.model('Notice', noticeScheme)
export default Notice
