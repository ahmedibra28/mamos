import nc from 'next-connect'
import db from '../../../config/db'
import { isAuth } from '../../../utils/auth'
import Transaction from '../../../models/Transaction'

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const q = req.query && req.query.q

    const allowedRoles = ['SUPER_ADMIN', 'LOGISTIC', 'ADMIN']
    const role = req.user.role

    const canAccess = allowedRoles.includes(role)

    let query = Transaction.find(
      q
        ? canAccess
          ? {
              TrackingNo: { $regex: q, $options: 'i' },
              type: { $in: ['FCL Booking', 'LCL Booking'] },
            }
          : {
              TrackingNo: { $regex: q, $options: 'i' },
              type: { $in: ['FCL Booking', 'LCL Booking'] },
              createdBy: req.user._id,
            }
        : canAccess
        ? { type: { $in: ['FCL Booking', 'LCL Booking'] } }
        : {
            type: { $in: ['FCL Booking', 'LCL Booking'] },
            createdBy: req.user._id,
          }
    )

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.limit) || 25
    const skip = (page - 1) * pageSize

    let total = await Transaction.countDocuments(
      q
        ? canAccess
          ? {
              TrackingNo: { $regex: q, $options: 'i' },
              type: { $in: ['FCL Booking', 'LCL Booking'] },
            }
          : {
              TrackingNo: { $regex: q, $options: 'i' },
              type: { $in: ['FCL Booking', 'LCL Booking'] },
              createdBy: req.user._id,
            }
        : canAccess
        ? { type: { $in: ['FCL Booking', 'LCL Booking'] } }
        : {
            type: { $in: ['FCL Booking', 'LCL Booking'] },
            createdBy: req.user._id,
          }
    )

    const pages = Math.ceil(total / pageSize)

    query = query
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .lean()
      // .populate('other.transportation')
      .populate('pickUp.pickUpCountry')
      .populate('pickUp.pickUpSeaport')
      .populate('dropOff.dropOffCountry')
      .populate('dropOff.dropOffSeaport')
      .populate('createdBy', ['name'])
    // .populate({
    //   path: 'other.transportation',
    //   populate: {
    //     path: 'vendor',
    //   },
    // })

    let result = await query
    // filter result and find the other.transportation from Transaction
    const newResultPromise = await Promise.all(
      result?.map(async (item) => {
        const tran = await Transaction.findOne(
          { _id: item?.other?.transportation },
          {
            vendor: 1,
            reference: 1,
            departureDate: 1,
            arrivalDate: 1,
            delayDate: 1,
          }
        ).populate('vendor')

        return {
          ...item,
          other: {
            ...item.other,
            transportation: tran,
          },
        }
      })
    )

    const newResult = await Promise.all(newResultPromise)

    res.status(200).json({
      startIndex: skip + 1,
      endIndex: skip + newResult.length,
      count: newResult.length,
      page,
      pages,
      total,
      data: newResult,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
