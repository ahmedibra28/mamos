import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Payment from '../../../models/Payment'
import { isAuth } from '../../../utils/auth'
import moment from 'moment'

const handler = nc()

const modelName = 'Payment'
const constants = {
  model: Payment,
  success: `${modelName} was updated successfully`,
  failed: `${modelName} was not updated successfully`,
  existed: `${modelName} was already existed`,
}

handler.use(isAuth)
handler.put(async (req, res) => {
  await dbConnect()

  const { amount } = req.body
  const _id = req.query.id
  const updatedBy = req.user.id

  const obj = await constants.model.findById(_id)

  if (obj) {
    const prevAmount =
      obj.payments.length > 0 &&
      obj.payments.reduce((acc, curr) => (acc += curr.amount), 0 || 0)

    if (obj.amount < Number(prevAmount) + Number(amount)) {
      return res
        .status(400)
        .send('Amount cannot be greater than the total amount')
    }
    const payment = {
      amount: amount,
      date: moment().format('YYYY-MM-DD'),
    }
    obj.payments.push(payment)
    obj.updatedBy = updatedBy
    await obj.save()

    res.json({ status: constants.success })
  } else {
    return res.status(404).send(constants.failed)
  }
})

handler.delete(async (req, res) => {
  await dbConnect()

  const _id = req.query.id
  const subPaymentId = req.query.subpaymentid

  const obj = await constants.model.findById(_id)
  if (!obj) {
    return res.status(404).send(constants.failed)
  } else {
    const payments = obj.payments.filter(
      (o) => o._id.toString() !== subPaymentId
    )
    obj.payments = payments
    await obj.save()

    res.json({ status: constants.success })
  }
})

export default handler
