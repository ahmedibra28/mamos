import nc from 'next-connect'
import dbConnect from '../../../../utils/db'
import Order from '../../../../models/Order'
import { isAuth } from '../../../../utils/auth'

import Income from '../../../../models/Income'
import Shipper from '../../../../models/Shipper'
import Town from '../../../../models/Town'
import Container from '../../../../models/Container'

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
          const town = await Town.findById(obj.pickup.pickUpTown, { cost: 1 })
          return town.cost
        }
      }
      const PAmount = Number((await pickUpAmount()) ? await pickUpAmount() : 0)

      const dropOffAmount = async () => {
        if (movementTypes.dropOff.includes(obj.movementType)) {
          const town = await Town.findById(obj.destination.dropOffTown, {
            cost: 1,
          })
          return town.cost
        }
      }
      const DAmount = Number(
        (await dropOffAmount()) ? await dropOffAmount() : 0
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

      return IAmount + PAmount + DAmount + LCL + FCL + AIR
    }

    const income = await Income.create({
      type: `${obj.cargoType} Cargo Order`,
      amount: await totalAmount(),
      description: `Order ${obj.id} - ${obj.trackingNo}`,
      order: obj._id,
      createdBy: obj.createdBy,
    })

    if (income) {
      obj.status = 'Shipped'
      obj.updatedBy = updatedBy
      await obj.save()
      res.json({ status: 'success' })
    } else {
      res.status(500).send('Income not created')
    }
  } else {
    return res.status(404).send('Order not found')
  }
})

export default handler
