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
            type: 'Payment',
            account: {
              $in: ['2100 Creditors Control Account'],
            },
          }
        : {
            status: 'Active',
            type: 'Payment',
            account: {
              $in: ['2100 Creditors Control Account'],
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
              $in: ['2100 Creditors Control Account'],
            },
          }
        : {
            status: 'Active',
            account: {
              $in: ['2100 Creditors Control Account'],
            },
          }
    )

    const pages = Math.ceil(total / pageSize)

    query = query
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .select('type amount vendor date description')
      .populate('vendor', ['name'])
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
    const { _id: vendor, amount } = req.body

    const transactions = await Transaction.find({
      status: 'Active',
      vendor,
      account: {
        $in: ['1001 Stock/Inventory', '2100 Creditors Control Account'],
      },
    })
      .select('type amount container vendor')
      .populate('vendor', ['name'])
      .lean()

    const totalOverWeight = transactions
      ?.filter((trans) => trans.type === 'Overweight')
      .reduce((acc, cur) => acc + Number(cur.amount), 0)

    const totalDemurrage = transactions
      ?.filter((trans) => trans.type === 'Demurrage')
      .reduce((acc, cur) => acc + Number(cur.amount), 0)

    const totalContainer = transactions
      ?.map((trans) => trans.type === 'Ship' && trans?.container)
      ?.flat()
      ?.filter((trans) => trans)
      ?.reduce((acc, cur) => acc + Number(cur.cost), 0)

    const totalPickUp = transactions
      ?.filter((trans) => trans.type === 'Pick Up')
      .reduce((acc, cur) => acc + Number(cur.amount), 0)

    const totalDropOff = transactions
      ?.filter((trans) => trans.type === 'Drop Off')
      .reduce((acc, cur) => acc + Number(cur.amount), 0)

    const totalPayment = transactions
      ?.filter((trans) => trans.type === 'Payment')
      .reduce((acc, cur) => acc + Number(cur.amount), 0)

    if (
      totalOverWeight +
        totalDemurrage +
        totalPickUp +
        totalDropOff +
        totalContainer -
        Number(totalPayment) <
      amount
    )
      return res
        .status(400)
        .json({ error: `Amount is greater than total amount` })

    const object = {
      date: new Date(),
      createdBy: req.user._id,
      reference: uuidv4(),
      type: 'Payment',
      account: ['1200 Bank Current Account', '2100 Creditors Control Account'],
      vendor,
      amount,
      description: `Payment of ${amount} to ${transactions[0]?.vendor?.name}`,
    }

    await Transaction.create(object)

    res.json({ message: 'Payment created successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
