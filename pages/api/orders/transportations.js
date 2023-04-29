import moment from 'moment'
import nc from 'next-connect'
import db from '../../../config/db'
import Transaction from '../../../models/Transaction'
import { isAuth } from '../../../utils/auth'
import { priceFormat } from '../../../utils/priceFormat'

const schemaName = Transaction

const handler = nc()
handler.use(isAuth)
handler.post(async (req, res) => {
  await db()
  try {
    const { pickUpSeaport, dropOffSeaport, cargo } = req.body

    let object = await schemaName
      .find({
        departureSeaport: pickUpSeaport,
        arrivalSeaport: dropOffSeaport,
        status: 'Active',
        vgmDate: { $gt: moment().format() },
      })
      .lean()
      .sort({ createdAt: -1 })
      .populate('container.container')
      .populate('vendor', ['name'])

    object = object.map((obj) => ({
      ...obj,
      cost: priceFormat(
        obj.container.reduce((acc, curr) => acc + Number(curr.cost), 0) || 0
      ),
      price: priceFormat(
        obj.container.reduce((acc, curr) => acc + Number(curr.price), 0) || 0
      ),

      TOTAL_CBM:
        obj.container
          ?.map((c) => c?.container)
          ?.reduce((acc, curr) => acc + curr?.details?.CBM, 0) || 0,
    }))

    if (cargo !== 'LCL') {
      object = object.filter((obj) => obj?.type === 'FCL Booking')
      return res.status(200).send(object)
    }

    const bookedShipments = []
    const newPromise = Promise.all(
      object?.map(async (trans) => {
        const order = await Transaction.find({
          'other.transportation': trans._id,
          type: 'LCL Booking',
          status: 'Pending',
        })

        const totalBookedCBM =
          order
            ?.map((o) => o?.other?.containers)
            ?.flat()
            ?.reduce(
              (acc, curr) =>
                acc +
                Number(curr?.length) *
                  Number(curr?.width) *
                  Number(curr?.height) *
                  Number(curr?.qty),
              0
            ) || 0

        bookedShipments.push({
          ...trans,
          totalBookedCBM: totalBookedCBM / 1000000,
        })
      })
    )

    await newPromise

    object = bookedShipments?.filter((ship) => ship.totalBookedCBM > 0)

    res.status(200).send(object)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
