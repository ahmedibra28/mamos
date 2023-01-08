import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
import Transaction from '../../../../models/Transaction'
import Account from '../../../../models/Account'
import moment from 'moment'

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const start = req.query?.start || moment().format('YYYY-MM-DD')
    const end = req.query?.end || moment().format('YYYY-MM-DD')

    let transactions = await Transaction.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${start} 00:00:00`),
            $lte: new Date(`${end} 23:59:59`),
          },
        },
      },
      {
        $group: {
          _id: '$account',
          totalAmount: {
            $sum: '$amount',
          },
        },
      },
      {
        $lookup: {
          from: 'accounts',
          localField: '_id',
          foreignField: '_id',
          as: 'account',
        },
      },
    ])

    transactions = transactions?.map((trans) => ({
      code: trans.account[0].code,
      amount: trans.totalAmount + trans.account[0].openingBalance,
    }))

    // const accountCash = await Account.findOne(
    //   { name: 'Cash' },
    //   { openingBalance: 1 }
    // )
    // const accountBank = await Account.findOne(
    //   { name: 'Bank' },
    //   { openingBalance: 1 }
    // )

    // ======================== RECEIPTS ========================
    const receipt = async () => {
      const receiptAccount = await Account.findOne(
        { code: 2023 },
        { code: 1, _id: 1, openingBalance: 1 }
      )

      const receipts = await Transaction.find(
        {
          account: receiptAccount._id,
          date: {
            $gte: new Date(`${start} 00:00:00`),
            $lte: new Date(`${end} 23:59:59`),
          },
        },
        { amount: 1, description: 1 }
      )

      let receiptCash = 0
      let receiptBank = 0
      receipts?.forEach(({ amount, description }) => {
        if (description === 'Receipts with Cash') {
          receiptCash = receiptCash + amount
        }
        if (description === 'Receipts with Bank') {
          receiptBank = receiptBank + amount
        }
      })

      return {
        // cash: receiptCash + accountCash?.openingBalance,
        // bank: receiptBank + accountBank?.openingBalance,
        cash: receiptCash,
        bank: receiptBank,
      }
    }

    // ======================== PAYMENT ========================
    const payment = async () => {
      const paymentAccount = await Account.findOne(
        { code: 2022 },
        { code: 1, _id: 1 }
      )

      const payments = await Transaction.find(
        {
          account: paymentAccount._id,
          date: {
            $gte: new Date(`${start} 00:00:00`),
            $lte: new Date(`${end} 23:59:59`),
          },
        },
        { amount: 1, description: 1 }
      )

      let paymentCash = 0
      let paymentBank = 0
      payments?.forEach(({ amount, description }) => {
        if (description === 'Payments with Cash') {
          paymentCash = paymentCash + amount
        }
        if (description === 'Payments with Bank') {
          paymentBank = paymentBank + amount
        }
      })

      return {
        // cash: accountCash?.openingBalance - paymentCash,
        // bank: accountBank?.openingBalance - paymentBank,
        cash: paymentCash,
        bank: paymentBank,
      }
    }

    const ap = transactions?.find(
      (trans) => trans.code === 21000 && delete trans.code
    ) || { amount: 0 }

    const ar = transactions?.find(
      (trans) => trans.code === 12100 && delete trans.code
    ) || { amount: 0 }
    const gos = transactions?.find(
      (trans) => trans.code === 40000 && delete trans.code
    ) || { amount: 0 }
    const expense = transactions?.find(
      (trans) => trans.code === 50000 && delete trans.code
    ) || { amount: 0 }

    const pay = await payment()
    const rec = await receipt()

    const data = {
      expense,
      ap,
      payment: pay,
      gos,
      ar,
      receipt: rec,
      finalAP: { amount: ap.amount - (pay.bank + pay.cash) },
      finalAR: { amount: ar.amount - (rec.bank + rec.cash) },
      cash: { amount: rec.cash - pay.cash },
      bank: { amount: rec.bank - pay.bank },
      grossIncome: { amount: gos.amount },
      netIncome: { amount: gos.amount - expense.amount },
    }

    return res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

handler.use(isAuth)

export default handler
