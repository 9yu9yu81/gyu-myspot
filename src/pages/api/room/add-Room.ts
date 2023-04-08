import type { NextApiRequest, NextApiResponse } from 'next'
import {
  AddressInfo,
  BasicInfo,
  MoreInfo,
  PrismaClient,
  Room,
  SaleInfo,
} from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

const prisma = new PrismaClient()

async function addRoom(
  userId: string,
  room: Omit<
    Room,
    'user_id' | 'id' | 'updatedAt' | 'status_id' | 'views' | 'wished'
  >,
  saleInfo: Omit<SaleInfo, 'id' | 'room_id'>,
  basicInfo: Omit<BasicInfo, 'id' | 'room_id'>,
  addressInfo: Omit<AddressInfo, 'id' | 'room_id'>,
  moreInfo: Omit<MoreInfo, 'id' | 'room_id'>
) {
  try {
    const roomData = await prisma.room.create({
      data: { ...room, user_id: userId },
    })
    await prisma.saleInfo.create({
      data: { ...saleInfo, room_id: roomData.id },
    })
    await prisma.basicInfo.create({
      data: { ...basicInfo, room_id: roomData.id },
    })
    await prisma.addressInfo.create({
      data: { ...addressInfo, room_id: roomData.id },
    })
    await prisma.moreInfo.create({
      data: { ...moreInfo, room_id: roomData.id },
    })

    return
  } catch (error) {
    console.error(error)
  }
}

type Data = {
  items?: any
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session = await getServerSession(req, res, authOptions)
  if (session == null) {
    res.status(200).json({ items: undefined, message: 'no Session' })
    return
  }

  const roomAllData = JSON.parse(req.body)

  try {
    const items = await addRoom(
      String(session.user?.id),
      roomAllData.room,
      roomAllData.saleInfo,
      roomAllData.basicInfo,
      roomAllData.addressInfo,
      roomAllData.moreInfo
    )
    res.status(200).json({ items: items, message: 'Success' })
  } catch (error) {
    res.status(400).json({ message: 'add Room Failed' })
  }
}
