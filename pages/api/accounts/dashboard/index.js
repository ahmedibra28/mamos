import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
import Transaction from '../../../../models/Transaction'
import moment from 'moment'

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const start = moment(req.query?.start).startOf('month').format('YYYY-MM-DD')
    const end = moment(req.query?.end).endOf('month').format('YYYY-MM-DD')

    // available transaction types Ship, FCL Booking, Demurrage, Overweight, Payment, Receipt

    // get all transactions type of Ship and add the Demurrage and Subtract the Payment
    const transactions = await Transaction.find({
      status: {
        $in: ['Confirmed', 'Active'],
      },
      type: {
        $in: [
          'Ship',
          'Demurrage',
          'Payment',
          'Receipt',
          'FCL Booking',
          'Overweight',
          'Pick Up',
          'Drop Off',
        ],
      },
      account: {
        $in: [
          '1001 Stock/Inventory',
          '2100 Creditors Control Account',
          '5000 Cost of Goods Sold',
          'TEMP 555',
        ],
      },
      date: {
        $gte: new Date(start),
        $lte: new Date(end),
      },
    })
      .select(
        'type amount container vendor customer pickUp.pickUpPrice dropOff.dropOffPrice status '
      )
      .populate('vendor', ['name'])
      .populate('customer', ['name'])
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

    const totalPayment = transactions
      ?.filter((trans) => trans.type === 'Payment')
      .reduce((acc, cur) => acc + Number(cur.amount), 0)

    const totalPickUpCost = transactions
      ?.filter((trans) => trans.type === 'Pick Up')
      .reduce((acc, cur) => acc + Number(cur.amount), 0)

    const totalDropOffCost = transactions
      ?.filter((trans) => trans.type === 'Drop Off')
      .reduce((acc, cur) => acc + Number(cur.amount), 0)

    const p = transactions?.filter(
      (trans) => trans.type === 'FCL Booking' && trans.status === 'Confirmed'
    )

    const totalPickUpPrice =
      transactions
        ?.filter(
          (trans) =>
            trans.type === 'FCL Booking' &&
            trans.status === 'Confirmed' &&
            trans.pickUp
        )
        .reduce((acc, cur) => acc + Number(cur.pickUp.pickUpPrice), 0) || 0

    const totalDropOffPrice =
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

    const totalGrossProfit =
      totalAmount +
      totalPickUpPrice +
      totalDropOffPrice -
      totalContainer -
      totalOverWeight -
      totalDemurrage -
      totalPickUpCost -
      totalDropOffCost

    const totalNetProfit = totalGrossProfit - totalPayment + totalReceipt

    return res.json({
      totalOverWeight,
      totalDemurrage,
      totalContainer,
      totalPayment,
      totalPickUpPrice,
      totalDropOffPrice,
      totalPickUpCost,
      totalDropOffCost,
      totalAmount,
      totalReceipt,
      totalGrossProfit,
      totalNetProfit,
    })

    // return res.status(403).json({ error: 'Not allowed' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

handler.use(isAuth)

export default handler
