import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
import Transaction from '../../../../models/Transaction'
import Account from '../../../../models/Account'

const schemaName = Transaction

const handler = nc()
handler.get(async (req, res) => {
  await db()
  try {
    const query = async (code) => {
      const account = await Account.findOne({ code })
      // vendors
      let vendors = await Transaction.aggregate([
        {
          $match: {
            account: account._id,
          },
        },
        {
          $group: {
            _id: '$vendor',
            totalAmount: {
              $sum: '$amount',
            },
          },
        },
        {
          $lookup: {
            from: 'vendors',
            localField: '_id',
            foreignField: '_id',
            as: 'vendor',
          },
        },
      ])

      vendors = vendors?.map((v) => ({
        _id: v._id,
        totalAmount: v.totalAmount,
        name: v.vendor[0]?.name,
        email: v.vendor[0]?.email,
        type: v.vendor[0]?.type,
      }))

      // customers
      let customers = await Transaction.aggregate([
        {
          $match: {
            account: account._id,
          },
        },
        {
          $group: {
            _id: '$customer',
            totalAmount: {
              $sum: '$amount',
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
      ])

      customers = customers?.map((c) => ({
        _id: c._id,
        totalAmount: c.totalAmount,
        name: c.user[0]?.name,
        email: c.user[0]?.email,
        type: 'customer',
      }))

      const transactions = [...customers, ...vendors]
      return transactions?.filter((trans) => trans._id)
    }

    const ap = await query(21000)
    const ar = await query(12100)
    const exp = await query(50000)
    const gos = await query(40000)
    const pay = await query(2022)
    const rec = await query(2023)

    res.json({ ap, ar, exp, gos, pay, rec })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

handler.use(isAuth)
handler.post(async (req, res) => {
  await db()
  try {
    const { code, name, openingBalance, description, status } = req.body

    const exist = await Transaction.findOne({
      name: { $regex: `^${name?.trim()}$`, $options: 'i' },
    })

    if (exist)
      return res.status(400).json({ error: 'Duplicate account type detected' })

    const object = await schemaName.create({
      code,
      name,
      openingBalance,
      description,
      status,
      createdBy: req.user._id,
    })

    res.status(200).send(object)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
