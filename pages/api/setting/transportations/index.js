import nc from 'next-connect'
import db from '../../../../config/db'
import Transaction from '../../../../models/Transaction'
import Container from '../../../../models/Container'
import { isAuth } from '../../../../utils/auth'
import { undefinedChecker } from '../../../../utils/helper'
import moment from 'moment'
import { priceFormat } from '../../../../utils/priceFormat'
import Seaport from '../../../../models/Seaport'
import Account from '../../../../models/Account'
import { v4 as uuidv4 } from 'uuid'

const schemaName = Transaction

const handler = nc()
handler.use(isAuth)
handler.get(async (req, res) => {
  await db()
  try {
    const q = req.query && req.query.q

    let query = schemaName.find(
      q ? { reference: { $regex: q, $options: 'i' } } : {}
    )

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.limit) || 25
    const skip = (page - 1) * pageSize
    const total = await schemaName.countDocuments(
      q ? { reference: { $regex: q, $options: 'i' } } : {}
    )

    const pages = Math.ceil(total / pageSize)

    query = query
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 })
      .lean()
      .populate('container.container', ['name'])
      .populate('vendor', ['name'])
      .populate({
        path: 'departureSeaport',
        select: ['country', 'name'],
        populate: { path: 'country', select: ['name'] },
      })
      .populate({
        path: 'arrivalSeaport',
        select: ['country', 'name'],
        populate: { path: 'country', select: ['name'] },
      })

    let result = await query

    result = result.map((trans) => ({
      ...trans,
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
      vendor,
      type,
      cargo,
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
    const reference = req.body.reference || uuidv4()

    const tempCost = Array.isArray(cost) ? cost[0] : cost
    const tempPrice = Array.isArray(price) ? price[0] : price

    if (cargo !== 'FCL') {
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
        status: 'Active',
      })
      if (!containerObj)
        return res.status(404).json({ error: 'Container not found' })
    })

    // FCL Container structuring
    if (cargo === 'FCL') {
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

    if (cargo !== 'FCL') {
      container = container.map((c) => ({
        container: c,
        cost: tempCost,
        price: tempPrice,
      }))
    }

    // check if status is Active
    if (departureSeaport || arrivalSeaport) {
      const departure = await Seaport.findOne({
        _id: departureSeaport,
        status: 'Active',
      })
      const arrival = await Seaport.findOne({
        _id: arrivalSeaport,
        status: 'Active',
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
      date: new Date(),
      type,
      account: ['1001 Stock/Inventory'],
      vendor,
      cargo,
      container,
      departureSeaport,
      arrivalSeaport,
      departureDate,
      arrivalDate,
      vgmDate,
      storageFreeGateInDate,
      shippingInstructionDate,
      delayDate,
      reference: reference.toUpperCase(),
      status,
      description: `Rent transportation from ${vendor}`,
      createdBy: req.user._id,
    })

    res.status(200).send(object)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
