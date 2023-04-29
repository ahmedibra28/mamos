import nc from 'next-connect'
import db from '../../../config/db'
import Transaction from '../../../models/Transaction'
import Tradelane from '../../../models/Tradelane'
import { isAuth } from '../../../utils/auth'
import { priceFormat } from '../../../utils/priceFormat'

const schemaName = Transaction

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const { id } = req.query

    const { role, _id } = req.user

    const allowedRoles = ['SUPER_ADMIN', 'LOGISTIC', 'ADMIN']
    const canAccess = allowedRoles.includes(role)

    let order = await schemaName
      .findOne(
        canAccess
          ? {
              _id: id,
              type: { $in: ['FCL Booking', 'LCL Booking'] },
            }
          : {
              createdBy: req.user._id,
              _id: id,
              type: { $in: ['FCL Booking', 'LCL Booking'] },
            }
      )
      .lean()
      .populate('createdBy', ['name'])
      .populate('pickUp.pickUpVendor')
      .populate('pickUp.pickUpCountry')
      .populate('pickUp.pickUpSeaport')
      .populate('dropOff.dropOffVendor')
      .populate('dropOff.dropOffCountry')
      .populate('dropOff.dropOffSeaport')
      .populate('other.transportation')
      // .populate('other.transportation.container.container')
      .populate('other.commodity')
      .populate('overWeight.vendor')
      .populate('buyer.buyerName', ['name'])

    if (!order) return res.status(404).json({ error: 'Transaction not found' })

    const tradelane = await Tradelane.findOne(
      {
        transportation: order.other.transportation,
      },
      { tradelane: 1 }
    ).lean()

    order = { ...order, tradelane: tradelane?.tradelane }

    order.other.transportation = await Transaction.findById(
      order.other.transportation
    )
      .populate('container.container')
      .populate('vendor')

    // const invoicePrice = order.other.isHasInvoice ? 0.0 : 200.0

    const pickUpPrice = order.pickUp.pickUpPrice || 0.0

    const dropOffPrice = order.dropOff.dropOffPrice || 0.0

    // console.log({ pickUpPrice })
    // console.log({ dropOffPrice })

    let containerInfo

    if (order.other.transportation.cargo === 'LCL') {
      containerInfo = order.other.transportation.container.map((c) => ({
        name: c.container?.name,
        CBM: c.container.details.CBM,
        quantity: c.quantity,
        price: c.price,
      }))
    } else {
      containerInfo = order.other.containers.map((c) => ({
        name: c.container?.name,
        CBM: c.container.details.CBM,
        quantity: c.quantity,
        price: c.price,
      }))
    }

    const cargo = order?.other?.transportation?.cargo
    const cbm =
      order.other?.containers?.reduce(
        (acc, cur) =>
          acc + Number(cur.width) * Number(cur.length) * Number(cur.height),
        0
      ) / 1000000

    const CustomerCBM = containerInfo.reduce(
      (acc, curr) =>
        acc +
        Number(cargo === 'LCL' ? cbm : curr.CBM) * Number(curr.quantity | 1),
      0
    )

    let CustomerPrice = containerInfo.reduce(
      (acc, curr) => acc + Number(curr.price) * Number(curr.quantity | 1),
      0
    )

    const containerCBM = containerInfo.reduce(
      (acc, curr) => acc + Number(curr.CBM) * Number(curr.quantity | 1),
      0
    )

    if (cargo === 'LCL') {
      CustomerPrice = (CustomerPrice / containerCBM) * cbm
    }

    const price = {
      // invoicePrice: priceFormat(invoicePrice),
      pickUpPrice: priceFormat(pickUpPrice),
      dropOffPrice: priceFormat(dropOffPrice),
      CustomerPrice: priceFormat(CustomerPrice),
      CustomerCBM: `${CustomerCBM.toFixed(2)} cubic meter`,
      containerCBM: `${containerCBM.toFixed(2)} cubic meter`,
      containerInfo: containerInfo,
      totalPrice: priceFormat(
        // Number(invoicePrice) +
        Number(pickUpPrice) + Number(dropOffPrice) + Number(CustomerPrice)
      ),
    }

    return res.status(200).send({
      ...order,
      price,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
