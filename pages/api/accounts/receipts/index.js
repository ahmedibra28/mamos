import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
import Transaction from '../../../../models/Transaction'

import { v4 as uuidv4 } from 'uuid'

const handler = nc()
handler.use(isAuth)

handler.get(async (req, res) => {
  await db()
  try {
    const q = req.query && req.query.q

    let query = Transaction.find(
      q
        ? {
            description: { $regex: q, $options: 'i' },
            status: 'Active',
            type: 'Receipt',
            account: {
              $in: ['TEMP 555'],
            },
          }
        : {
            status: 'Active',
            type: 'Receipt',
            account: {
              $in: ['TEMP 555'],
            },
          }
    )

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.limit) || 25
    const skip = (page - 1) * pageSize
    const total = await Transaction.countDocuments(
      q
        ? {
            description: { $regex: q, $options: 'i' },
            status: 'Active',
            account: {
              $in: ['TEMP 555'],
            },
          }
        : {
            status: 'Active',
            account: {
              $in: ['TEMP 555'],
            },
          }
    )

    const pages = Math.ceil(total / pageSize)

    query = query
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .select('type amount customer date description')
      .populate('createdBy', ['name'])
      .lean()

    const result = await query

    res.status(200).json({
      startIndex: skip + 1,
      endIndex: skip + result.length,
      count: result.length,
      page,
      pages,
      total,
      data: result,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

handler.post(async (req, res) => {
  await db()
  try {
    const { _id: customer, amount } = req.body

    const transactions = await Transaction.find({
      type: { $in: ['Receipt', 'FCL Booking'] },
      customer,
      status: {
        $in: ['Confirmed', 'Active'],
      },
      account: {
        $in: ['5000 Cost of Goods Sold', 'TEMP 555'],
      },
    })
      .select(
        'type amount pickUp.pickUpPrice, dropOff.dropOffPrice createdBy status'
      )
      .populate('createdBy', ['name'])
      .lean()

    const totalPickUp =
      transactions
        ?.filter(
          (trans) =>
            trans.type === 'FCL Booking' &&
            trans.status === 'Confirmed' &&
            trans.pickUp
        )
        .reduce((acc, cur) => acc + Number(cur.pickUp.pickUpPrice), 0) || 0

    const totalDropOff =
      transactions
        ?.filter(
          (trans) =>
            trans.type === 'FCL Booking' &&
            trans.status === 'Confirmed' &&
            trans.dropOff
        )
        .reduce((acc, cur) => acc + Number(cur.dropOff.dropOffPrice), 0) || 0

    const totalAmount =
      transactions
        ?.filter(
          (trans) =>
            trans.type === 'FCL Booking' && trans.status === 'Confirmed'
        )
        ?.reduce((acc, cur) => acc + Number(cur.amount), 0) || 0

    const totalReceipt = transactions
      ?.filter((trans) => trans.type === 'Receipt')
      .reduce((acc, cur) => acc + Number(cur.amount), 0)

    if (
      totalPickUp + totalDropOff + totalAmount - Number(totalReceipt) <
      amount
    )
      return res
        .status(400)
        .json({ error: `Amount is greater than total amount` })

    const object = {
      date: new Date(),
      createdBy: req.user._id,
      reference: uuidv4(),
      type: 'Receipt',
      account: ['1200 Bank Current Account', 'TEMP 555'],
      customer,
      amount,
      description: `Receipt of ${amount} to ${transactions[0]?.createdBy?.name}`,
    }

    await Transaction.create(object)

    res.json({ message: 'Receipt created successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
