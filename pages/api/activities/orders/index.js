import moment from 'moment'
import nc from 'next-connect'
import db from '../../../../config/db'
import Container from '../../../../models/Container'
import Order from '../../../../models/Order'
import Tradelane from '../../../../models/Tradelane'
import Transportation from '../../../../models/Transportation'
import { priceFormat } from '../../../../utils/priceFormat'
import { isAuth } from '../../../../utils/auth'

const schemaName = Order

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const q = req.query && req.query.q

    const start = moment(q).clone().startOf('month').format()
    const end = moment(q).clone().endOf('month').format()

    let query = schemaName.find(
      q
        ? {
            createdAt: { $gte: start, $lt: end },
          }
        : {}
    )

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.limit) || 25
    const skip = (page - 1) * pageSize
    const total = await schemaName.countDocuments(
      q
        ? {
            createdAt: { $gte: start, $lt: end },
          }
        : {}
    )

    const pages = Math.ceil(total / pageSize)

    query = query
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .lean()
      .populate('createdBy', ['name'])
      .populate('pickUp.pickUpTown')
      .populate('pickUp.pickUpCountry')
      .populate('pickUp.pickUpSeaport')
      .populate('dropOff.dropOffTown')
      .populate('dropOff.dropOffCountry')
      .populate('dropOff.dropOffSeaport')
      .populate('other.transportation')
      .populate('other.transportation.container.container')
      .populate('other.commodity')

    let result = await query

    const tradelanes = Promise.all(
      result.map(async (order) => {
        const tradelane = await Tradelane.findOne(
          {
            transportation: order.other.transportation._id,
          },
          { tradelane: 1 }
        ).lean()

        order = { ...order, tradelane: tradelane?.tradelane }

        order.other.transportation = await Transportation.findById(
          order.other.transportation._id
        ).populate('container.container')

        const invoicePrice = order.other.isHasInvoice ? 0.0 : 200.0

        const pickUpPrice = order.pickUp.pickUpTown
          ? order.pickUp.pickUpTown.price
          : 0.0
        const dropOffPrice = order.dropOff.dropOffTown
          ? order.dropOff.dropOffTown.price
          : 0.0

        const containerInfo = order.other.containers
          ? order.other.containers.map((c) => ({
              name: c.container.name,
              CBM: c.container.details.CBM,
              quantity: c.quantity,
              price: c.price,
            }))
          : order.other.containerFCL.map((c) => ({
              name: c.container.name,
              CBM: c.container.details.CBM,
              quantity: c.quantity,
              price: c.price,
            }))

        const CustomerCBM = containerInfo.reduce(
          (acc, curr) => acc + Number(curr.CBM) * Number(curr.quantity),
          0
        )

        const CustomerPrice = containerInfo.reduce(
          (acc, curr) => acc + Number(curr.price) * Number(curr.quantity),
          0
        )
        const containerCBM = containerInfo.reduce(
          (acc, curr) => acc + Number(curr.CBM) * Number(curr.quantity),
          0
        )

        const price = {
          invoicePrice: priceFormat(invoicePrice),
          pickUpPrice: priceFormat(pickUpPrice),
          dropOffPrice: priceFormat(dropOffPrice),
          CustomerPrice: priceFormat(CustomerPrice),
          CustomerCBM: `${CustomerCBM.toFixed(2)} cubic meter`,
          containerCBM: `${containerCBM.toFixed(2)} cubic meter`,
          containerInfo: containerInfo,
          totalPrice: priceFormat(
            Number(invoicePrice) +
              Number(pickUpPrice) +
              Number(dropOffPrice) +
              Number(CustomerPrice)
          ),
        }

        return {
          ...order,
          price,
        }

        // return order
      })
    )
    const tradelane = await tradelanes

    result = tradelane

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

export default handler
