import type { NextApiRequest, NextApiResponse } from 'next'
import {
  AddressInfo,
  BasicInfo,
  MoreInfo,
  PrismaClient,
  Room,
  SaleInfo,
} from '@prisma/client'

const prisma = new PrismaClient()

async function addRoom(
  room: Omit<Room, 'updatedAt' | 'status_id' | 'views' | 'wished'>,
  saleInfo: Omit<SaleInfo, 'id' | 'room_id'>,
  basicInfo: Omit<BasicInfo, 'id' | 'room_id'>,
  addressInfo: Omit<AddressInfo, 'id' | 'room_id'>,
  moreInfo: Omit<MoreInfo, 'id' | 'room_id'>
) {
  try {
    const response = await prisma.room.update({
      where: { id: room.id },
      data: { ...room },
    })
    await prisma.saleInfo.update({
      where: { room_id: room.id },
      data: { ...saleInfo },
    })
    await prisma.basicInfo.update({
      where: { room_id: room.id },
      data: { ...basicInfo },
    })
    await prisma.addressInfo.update({
      where: { room_id: room.id },
      data: { ...addressInfo },
    })
    await prisma.moreInfo.update({
      where: { room_id: room.id },
      data: { ...moreInfo },
    })
    console.log(response)
    return response
  } catch (error) {
    console.error(error)
  }
}

type Data = {
  items?: any
  message: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const roomAllData = JSON.parse(req.body)

  try {
    const items = await addRoom(
      roomAllData.room,
      roomAllData.saleInfo,
      roomAllData.basicInfo,
      roomAllData.addressInfo,
      roomAllData.moreInfo
    )
    res.status(200).json({ items: items, message: 'Success' })
  } catch (error) {
    res.status(400).json({ message: 'Failed' })
  }
}
