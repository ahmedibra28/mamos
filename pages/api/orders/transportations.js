import moment from 'moment'
import nc from 'next-connect'
import db from '../../../config/db'
import Transportation from '../../../models/Transportation'
import Order from '../../../models/Order'
import { isAuth } from '../../../utils/auth'
import { priceFormat } from '../../../utils/priceFormat'

const schemaName = Transportation

const handler = nc()
handler.use(isAuth)
handler.post(async (req, res) => {
  await db()
  try {
    const {
      transportationType,
      pickUpAirport,
      pickUpSeaport,
      dropOffAirport,
      dropOffSeaport,
      cargoType,
    } = req.body

    if (transportationType === 'plane') {
      let object = await schemaName
        .find({
          departureAirport: pickUpAirport,
          arrivalAirport: dropOffAirport,
          cargoType,
          status: 'active',
          departureDate: { $gt: moment().format() },
        })
        .lean()
        .sort({ createdAt: -1 })
        .populate('arrivalSeaport')
        .populate('arrivalAirport')
        .populate('departureSeaport')
        .populate('departureAirport')
        .populate('container.container')

      object = object.map((obj) => ({
        ...obj,
        price: priceFormat(obj.price),
      }))

      object = Promise.all(
        object.map(async (obj) => {
          const order = await Order.find(
            {
              transportation: obj._id,
              'other.cargoType': 'AIR',
              status: 'confirmed',
            },
            { 'other.containerLCL': 1 }
          )

          return {
            ...obj,
            USED_CBM: order
              ?.map((o) => o?.other?.containerLCL)
              ?.flat(Infinity)
              ?.reduce(
                (acc, curr) =>
                  acc +
                  (Number(curr.length) *
                    Number(curr.width) *
                    Number(curr.height)) /
                    1000,
                0
              ),
          }
        })
      )

      res.status(200).send(await object)
    }
    if (transportationType === 'ship') {
      let object = await schemaName
        .find({
          departureSeaport: pickUpSeaport,
          arrivalSeaport: dropOffSeaport,
          cargoType,
          status: 'active',
          departureDate: { $gt: moment().format() },
        })
        .lean()
        .sort({ createdAt: -1 })
        .populate('arrivalSeaport')
        .populate('arrivalAirport')
        .populate('departureSeaport')
        .populate('departureAirport')
        .populate('container.container')

      object = object.map((obj) => ({
        ...obj,
        cost:
          obj.cargoType === 'FCL'
            ? priceFormat(
                obj?.container?.reduce(
                  (acc, curr) => acc + Number(curr?.cost),
                  0
                ) || 0
              )
            : priceFormat(obj.cost),
        price:
          obj.cargoType === 'FCL'
            ? priceFormat(
                obj?.container?.reduce(
                  (acc, curr) => acc + Number(curr?.price),
                  0
                ) || 0
              )
            : priceFormat(obj.price),
      }))

      object = Promise.all(
        object.map(async (obj) => {
          const order = await Order.find(
            {
              transportation: obj._id,
              'other.cargoType': 'LCL',
              status: 'confirmed',
            },
            { 'other.containerLCL': 1 }
          )
          return {
            ...obj,
            USED_CBM: order
              ?.map((o) => o?.other?.containerLCL)
              ?.flat(Infinity)
              ?.reduce(
                (acc, curr) =>
                  acc +
                  (Number(curr.length) *
                    Number(curr.width) *
                    Number(curr.height)) /
                    1000,
                0
              ),
          }
        })
      )

      res.status(200).send(await object)
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
