import nc from 'next-connect'
import dbConnect from '../../../../utils/db'
import Order from '../../../../models/Order'
import { isAuth } from '../../../../utils/auth'

import Income from '../../../../models/Income'
import Shipper from '../../../../models/Shipper'
import Town from '../../../../models/Town'
import Container from '../../../../models/Container'
import Expense from '../../../../models/Expense'

const handler = nc()
handler.use(isAuth)

handler.put(async (req, res) => {
  await dbConnect()

  const _id = req.query.status
  const updatedBy = req.user.id

  const obj = await Order.findById(_id)

  if (obj) {
    const movementTypes = {
      pickUp: ['Door to Door', 'Door to Port', 'Door to Airport'],
      dropOff: ['Door to Door', 'Port to Door', 'Airport to Door'],
    }

    const shipment = await Shipper.findById(obj.shipment)

    const totalAmount = async () => {
      const invoiceAmount = async () => !obj.isHasInvoice && 79

      const IAmount = Number(
        (await invoiceAmount()) ? await invoiceAmount() : 0
      )

      const pickUpAmount = async () => {
        if (movementTypes.pickUp.includes(obj.movementType)) {
          const town = await Town.findById(obj.pickup.pickUpTown, {
            cost: 1,
            price: 1,
          })
          return { cost: town.cost, price: town.price }
        }
      }
      const PAmountCost = Number(
        (await pickUpAmount()) ? await (await pickUpAmount()).cost : 0
      )
      const PAmountPrice = Number(
        (await pickUpAmount()) ? await (await pickUpAmount()).price : 0
      )

      const dropOffAmount = async () => {
        if (movementTypes.dropOff.includes(obj.movementType)) {
          const town = await Town.findById(obj.destination.dropOffTown, {
            cost: 1,
            price: 1,
          })
          return { cost: town.cost, price: town.price }
        }
      }

      const DAmountCost = Number(
        (await dropOffAmount()) ? await (await dropOffAmount()).cost : 0
      )
      const DAmountPrice = Number(
        (await dropOffAmount()) ? await (await dropOffAmount()).price : 0
      )

      const LCLAmount = async () => {
        if (obj.cargoType === 'LCL') {
          const TotalCBM = await obj.containerLCL.reduce(
            (acc, curr) => acc + curr.length * curr.width * curr.height,
            0
          )
          return shipment.price * TotalCBM * 167
        }
      }
      const LCL = Number((await LCLAmount()) ? await LCLAmount() : 0)

      const AIRAmount = async () => {
        if (obj.cargoType === 'AIR') {
          const TotalCBM = await obj.containerLCL.reduce(
            (acc, curr) => acc + curr.qty * curr.weight,
            0
          )
          return shipment.price * TotalCBM * 167
        }
      }
      const AIR = Number((await AIRAmount()) ? await AIRAmount() : 0)

      const FCLAmount = async () => {
        if (obj.cargoType === 'FCL') {
          const allContainers = obj.containerFCL.map(async (c) => {
            const containers = await Container.findById(c.container)
            return containers.payloadCapacity * c.quantity * shipment.price
          })

          return await Promise.all(allContainers)
        }
      }
      const FCLArray = await FCLAmount()
      const FCL = Number(FCLArray)
        ? FCLArray.reduce((acc, curr) => acc + curr, 0)
        : 0

      const totalAmount = IAmount + LCL + FCL + AIR
      const amounts = {
        totalAmount,
        IAmount,
        PAmountCost,
        PAmountPrice,
        DAmountPrice,
        DAmountCost,
        LCL,
        FCL,
        AIR,
      }

      return amounts
    }

    // pickup income
    if (movementTypes.pickUp.includes(obj.movementType)) {
      await Income.create({
        type: `Pick Up`,
        amount: await (await totalAmount()).PAmountPrice,
        description: `Order ${obj.id} - ${obj.trackingNo}`,
        order: obj._id,
        town: obj.pickup.pickUpTown,
        createdBy: updatedBy,
      })
    }

    // dropoff income
    if (movementTypes.dropOff.includes(obj.movementType)) {
      await Income.create({
        type: `Drop Off`,
        amount: await (await totalAmount()).DAmountPrice,
        description: `Order ${obj.id} - ${obj.trackingNo}`,
        order: obj._id,
        town: obj.destination.dropOffTown,
        createdBy: updatedBy,
      })
    }

    // order income
    await Income.create({
      type: `${obj.cargoType} Cargo Order`,
      amount: await (await totalAmount()).totalAmount,
      description: `Order ${obj.id} - ${obj.trackingNo}`,
      order: obj._id,
      createdBy: updatedBy,
    })

    // pickup expense
    if (movementTypes.pickUp.includes(obj.movementType)) {
      await Expense.create({
        type: `Pick Up`,
        amount: await (await totalAmount()).PAmountCost,
        description: `Order ${obj.id} - ${obj.trackingNo}`,
        order: obj._id,
        town: obj.pickup.pickUpTown,
        createdBy: updatedBy,
      })
    }

    // dropoff expense
    if (movementTypes.dropOff.includes(obj.movementType)) {
      await Expense.create({
        type: `Drop Off`,
        amount: await (await totalAmount()).DAmountCost,
        description: `Order ${obj.id} - ${obj.trackingNo}`,
        order: obj._id,
        town: obj.destination.dropOffTown,
        createdBy: updatedBy,
      })
    }

    obj.status = 'Shipped'
    obj.updatedBy = updatedBy
    await obj.save()
    res.json({ status: 'success' })
  } else {
    return res.status(404).send('Order not found')
  }
})

export default handler
