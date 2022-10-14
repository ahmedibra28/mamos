import nc from 'next-connect'
import db from '../../../../config/db'
import Transportation from '../../../../models/Transportation'
import Container from '../../../../models/Container'
import { isAuth } from '../../../../utils/auth'
import { undefinedChecker } from '../../../../utils/helper'
import moment from 'moment'
import { priceFormat } from '../../../../utils/priceFormat'
import Seaport from '../../../../models/Seaport'

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
      .populate('container.container')
      .populate({
        path: 'departureSeaport',
        populate: { path: 'country' },
      })
      .populate({
        path: 'arrivalSeaport',
        populate: { path: 'country' },
      })

    let result = await query

    result = result.map((trans) => ({
      ...trans,
      departureDate: moment(trans.departureDate).format('YYYY-MM-DD'),
      arrivalDate: moment(trans.arrivalDate).format('YYYY-MM-DD'),
      storageFreeGateInDate: moment(trans.storageFreeGateInDate).format(
        'YYYY-MM-DD'
      ),
      shippingInstructionDate: moment(trans.shippingInstructionDate).format(
        'YYYY-MM-DD'
      ),
      vgmDate: moment(trans.vgmDate).format('YYYY-MM-DD'),
      delayDate: moment(trans.delayDate).format('YYYY-MM-DD'),
      cost: priceFormat(
        trans.container.reduce((acc, curr) => acc + Number(curr.cost), 0) || 0
      ),
      price: priceFormat(
        trans.container.reduce((acc, curr) => acc + Number(curr.price), 0) || 0
      ),
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
      reference,
      transportationType,
      cargoType,
      cost,
      price,
      departureSeaport,
      arrivalSeaport,
      departureDate,
      arrivalDate,
      vgmDate,
      storageFreeGateInDate,
      shippingInstructionDate,
      delayDate,
      status,
    } = req.body
    let container = req.body.container

    const tempCost = Array.isArray(cost) ? cost[0] : cost
    const tempPrice = Array.isArray(price) ? price[0] : price

    if (cargoType !== 'FCL') {
      if (Number(tempCost) > Number(tempPrice))
        return res
          .status(404)
          .json({ error: 'Cost must be less than price amount' })
    }
    if (
      arrivalDate < departureDate ||
      arrivalDate > delayDate ||
      departureDate < vgmDate ||
      departureDate < storageFreeGateInDate ||
      departureDate < shippingInstructionDate
    )
      return res.status(400).json({
        error:
          'Arrival date must be after (storage free gate in date, shipping instructions date and VGM date)',
      })

    container = Array.isArray(container) ? container : [container]

    container.map(async (c) => {
      const containerObj = await Container.findOne({
        _id: c,
        status: 'active',
      })
      if (!containerObj)
        return res.status(404).json({ error: 'Container not found' })
    })

    // FCL Container structuring
    if (cargoType === 'FCL') {
      const containerLength = container.length

      const costAmount = Array.isArray(cost)
        ? cost
        : cost.split(',').map((c) => c.trim())

      const priceAmount = Array.isArray(price)
        ? price
        : price.split(',').map((c) => c.trim())

      if (
        containerLength !== costAmount.length ||
        containerLength !== priceAmount.length
      ) {
        return res.status(400).json({ error: 'Container or price mismatched' })
      }

      const result = container.map((c, i) => {
        if (Number(costAmount[i]) > Number(priceAmount[i]))
          return res
            .status(404)
            .json({ error: 'Cost must be greater than price amount' })

        return {
          container: c,
          cost: costAmount[i],
          price: priceAmount[i],
        }
      })
      container = result
    }

    if (cargoType !== 'FCL') {
      container = container.map((c) => ({
        container: c,
        cost: tempCost,
        price: tempPrice,
      }))
    }

    // check if status is active
    if (departureSeaport || arrivalSeaport) {
      const departure = await Seaport.findOne({
        _id: departureSeaport,
        status: 'active',
      })
      const arrival = await Seaport.findOne({
        _id: arrivalSeaport,
        status: 'active',
      })
      if (!departure || !arrival)
        return res
          .status(404)
          .json({ error: 'Departure or arrival seaport not found' })
    }

    const trans = await schemaName.findOne({
      reference: reference.toUpperCase(),
    })
    if (trans) return res.status(400).json({ error: 'Reference already exist' })

    const object = await schemaName.create({
      name,
      transportationType,
      cargoType,
      container,
      departureSeaport: undefinedChecker(departureSeaport),
      arrivalSeaport: undefinedChecker(arrivalSeaport),
      departureDate,
      arrivalDate,
      vgmDate,
      storageFreeGateInDate,
      shippingInstructionDate,
      delayDate,
      reference,
      status,
      createdBy: req.user._id,
    })
    res.status(200).send(object)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
