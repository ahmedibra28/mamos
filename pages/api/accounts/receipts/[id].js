import nc from 'next-connect'
import db from '../../../../config/db'
import Account from '../../../../models/Account'
import { isAuth } from '../../../../utils/auth'
import Vendor from '../../../../models/Vendor'
import Transaction from '../../../../models/Transaction'

const handler = nc()
handler.use(isAuth)
handler.put(async (req, res) => {
  await db()
  try {
    const { account, amount, status, vendor, totalAmount } = req.body

    if (status === 'accounts receivable') {
      // check existence
      const accObj = await Account.findOne({
        _id: account,
        status: 'active',
        type: 'default',
      })
      if (!accObj) return res.status(400).json({ error: `Account not found` })

      const vObj = await Vendor.findOne({ _id: vendor, status: 'active' })
      if (!vObj) return res.status(400).json({ error: `Vendor not found` })

      const ap = await Account.findOne({ code: 21000 }, { _id: 1 })

      const customClearanceTransaction = {
        date: new Date(),
        discount: 0,
        createdBy: req.user._id,
        account: ap?._id,
        vendor: vObj._id,
        amount: Number(amount),
        description: `Custom Clearance`,
      }
      const a = await Transaction.create(customClearanceTransaction)
      if (!a)
        return res
          .status(400)
          .json({ error: 'Error creating receivable transaction' })

      res.status(200).send('success')
    }
    if (status === 'receipts') {
      if (totalAmount < Number(amount))
        return res
          .status(400)
          .json({ error: 'Amount has exceeded total amount' })

      // check existence
      const cashBankAcc = await Account.findOne({
        _id: account,
        status: 'active',
        type: 'custom',
      })
      if (!cashBankAcc)
        return res.status(400).json({ error: `Account not found` })
      const rec = await Account.findOne({ code: 2023 }, { _id: 1 })
      const exp = await Account.findOne({ code: 50000 }, { _id: 1 })

      // Expenses
      const expTransaction = {
        date: new Date(),
        discount: 0,
        createdBy: req.user._id,
        account: exp?._id,
        vendor: req.body._id,
        amount: Number(amount),
        description: `Expenses`,
      }
      const e = await Transaction.create(expTransaction)
      if (!e)
        return res
          .status(400)
          .json({ error: 'Error creating expense transaction' })

      // Receipt
      const recTransaction = {
        date: new Date(),
        discount: 0,
        createdBy: req.user._id,
        account: rec?._id,
        vendor: req.body._id,
        amount: Number(amount),
        description: `Receipts with ${cashBankAcc?.name}`,
      }
      const p = await Transaction.create(recTransaction)
      if (!p)
        return res
          .status(400)
          .json({ error: 'Error creating receipt transaction' })
      res.status(200).send('success')
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
