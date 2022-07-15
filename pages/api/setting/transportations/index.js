import nc from 'next-connect'
import db from '../../../../config/db'
import Transportation from '../../../../models/Transportation'
import Container from '../../../../models/Container'
import { isAuth } from '../../../../utils/auth'
import { undefinedChecker } from '../../../../utils/helper'
import moment from 'moment'
import { priceFormat } from '../../../../utils/priceFormat'
import Seaport from '../../../../models/Seaport'
import Airport from '../../../../models/Airport'

const schemaName = Transportation

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const q = req.query && req.query.q

    let query = schemaName.find(q ? { name: { $regex: q, $options: 'i' } } : {})

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.limit) || 25
    const skip = (page - 1) * pageSize
    const total = await schemaName.countDocuments(
      q ? { name: { $regex: q, $options: 'i' } } : {}
    )

    const pages = Math.ceil(total / pageSize)

    query = query
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .lean()
      .populate('container')
      .populate({
        path: 'departureSeaport',
        populate: { path: 'country' },
      })
      .populate({
        path: 'arrivalSeaport',
        populate: { path: 'country' },
      })
      .populate({
        path: 'arrivalAirport',
        populate: { path: 'country' },
      })
      .populate({
        path: 'departureAirport',
        populate: { path: 'country' },
      })

    let result = await query

    result = result.map((trans) => ({
      ...trans,
      departureDate: moment(trans.departureDate).format('YYYY-MM-DD'),
      arrivalDate: moment(trans.arrivalDate).format('YYYY-MM-DD'),
      cost: priceFormat(trans.cost),
      price: priceFormat(trans.price),
    }))

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

handler.post(async (req, res) => {
  await db()
  try {
    const {
      name,
      transportationType,
      cargoType,
      cost,
      price,
      container,
      departureSeaport,
      arrivalSeaport,
      departureAirport,
      arrivalAirport,
      departureDate,
      arrivalDate,
      status,
    } = req.body

    if (Number(cost) > Number(price))
      return res
        .status(404)
        .json({ error: 'Cost must be greater than price amount' })

    if (arrivalDate < departureDate)
      return res
        .status(400)
        .json({ error: 'Arrival date must be after departure date' })

    const containerObj = await Container.findOne({
      _id: container,
      status: 'active',
    })
    if (!containerObj)
      return res.status(404).json({ error: 'Container not found' })

    // check if status is active
    if (departureSeaport || arrivalSeaport) {
      const departure = await Seaport.findOne({
        _id: departureSeaport,
        status: 'active',
      })
      const arrival = await Seaport.findOne({
        _id: airportSeaport,
        status: 'active',
      })
      if (!departure || !arrival)
        return res
          .status(404)
          .json({ error: 'Departure or arrival seaport not found' })
    }

    if (departureAirport || arrivalAirport) {
      const departure = await Airport.findOne({
        _id: departureAirport,
        status: 'active',
      })
      const arrival = await Airport.findOne({
        _id: airportAirport,
        status: 'active',
      })
      if (!departure || !arrival)
        return res
          .status(404)
          .json({ error: 'Departure or arrival airport not found' })
    }

    const object = await schemaName.create({
      name,
      transportationType,
      cargoType,
      cost,
      price,
      container,
      departureSeaport: undefinedChecker(departureSeaport),
      arrivalSeaport: undefinedChecker(arrivalSeaport),
      departureAirport: undefinedChecker(departureAirport),
      arrivalAirport: undefinedChecker(arrivalAirport),
      departureDate,
      arrivalDate,
      status,
      createdBy: req.user.id,
    })
    res.status(200).send(object)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
