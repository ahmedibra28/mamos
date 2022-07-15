import moment from 'moment'
import nc from 'next-connect'
import db from '../../../../config/db'
import Transportation from '../../../../models/Transportation'
import { isAuth } from '../../../../utils/auth'
import { priceFormat } from '../../../../utils/priceFormat'

const schemaName = Transportation

const handler = nc()
handler.use(isAuth)
handler.post(async (req, res) => {
  await db()
  try {
    const {
      transportationType,
      pickupAirport,
      pickupSeaport,
      destinationAirport,
      destinationSeaport,
      cargoType,
    } = req.body

    if (transportationType === 'plane') {
      let object = await schemaName
        .find({
          departureAirport: pickupAirport,
          arrivalAirport: destinationAirport,
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
        .populate('container')

      object = object.map((obj) => ({
        ...obj,
        price: priceFormat(obj.price),
      }))

      res.status(200).send(object)
    }
    if (transportationType === 'ship') {
      let object = await schemaName
        .find({
          departureSeaport: pickupSeaport,
          arrivalSeaport: destinationSeaport,
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
        .populate('container')

      object = object.map((obj) => ({
        ...obj,
        price: priceFormat(obj.price),
      }))

      res.status(200).send(object)
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
