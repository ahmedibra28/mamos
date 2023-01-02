import nc from 'next-connect'
import db from '../../../config/db'
import Order from '../../../models/Order'
import Transportation from '../../../models/Transportation'
import Tradelane from '../../../models/Tradelane'
import { isAuth } from '../../../utils/auth'
import { priceFormat } from '../../../utils/priceFormat'
import User from '../../../models/User'

const schemaName = Order

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const { id } = req.query

    const { role, _id } = req.user

    const allowedRoles = ['SUPER_ADMIN', 'LOGISTIC', 'ADMIN']
    const canAccess = allowedRoles.includes(role)
    const mamosBooker = await User.findOne(
      { email: 'booking@mamosbusiness.com' },
      { _id: 1 }
    )

    let order = await schemaName
      .findOne(
        canAccess
          ? role === 'LOGISTIC'
            ? { createdBy: mamosBooker._id, _id: id }
            : { _id: id }
          : {
              createdBy: _id,
              _id: id,
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
      .populate('other.transportation.container.container')
      .populate('other.commodity')
      .populate('overWeight.vendor')

    if (!order) return res.status(404).json({ error: 'Order not found' })
    const tradelane = await Tradelane.findOne(
      {
        transportation: order.other.transportation._id,
      },
      { tradelane: 1 }
    ).lean()

    order = { ...order, tradelane: tradelane?.tradelane }

    order.other.transportation = await Transportation.findById(
      order.other.transportation._id
    )
      .populate('container.container')
      .populate('vendor')

    // const invoicePrice = order.other.isHasInvoice ? 0.0 : 200.0

    const pickUpPrice = order.pickUp.pickUpPrice || 0.0

    const dropOffPrice = order.dropOff.dropOffPrice || 0.0

    const containerInfo = order.other.containers.map((c) => ({
      name: c.container.name,
      CBM: c.container.details.CBM,
      quantity: c.quantity,
      price: c.price,
    }))

    const customerCBM = containerInfo.reduce(
      (acc, curr) => acc + Number(curr.CBM) * Number(curr.quantity),
      0
    )

    const customerPrice = containerInfo.reduce(
      (acc, curr) => acc + Number(curr.price) * Number(curr.quantity),
      0
    )
    const containerCBM = containerInfo.reduce(
      (acc, curr) => acc + Number(curr.CBM) * Number(curr.quantity),
      0
    )

    const price = {
      // invoicePrice: priceFormat(invoicePrice),
      pickUpPrice: priceFormat(pickUpPrice),
      dropOffPrice: priceFormat(dropOffPrice),
      customerPrice: priceFormat(customerPrice),
      customerCBM: `${customerCBM.toFixed(2)} cubic meter`,
      containerCBM: `${containerCBM.toFixed(2)} cubic meter`,
      containerInfo: containerInfo,
      totalPrice: priceFormat(
        // Number(invoicePrice) +
        Number(pickUpPrice) + Number(dropOffPrice) + Number(customerPrice)
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
