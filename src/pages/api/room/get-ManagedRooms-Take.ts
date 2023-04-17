import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

const prisma = new PrismaClient()

async function getManagedRooms(user_id: string, skip: number, take: number) {
  try {
    const response = await prisma.$queryRaw`
      select r.id, r.category_id, r.status_id,r.updatedAt, r.title, r.views, r.wished, r.images, 
            s.type_id as sType_id, s.deposit, s.fee,
            a.doro, a.detail,
            b.area
            from Room as r, SaleInfo as s, AddressInfo as a, BasicInfo as b
            where r.id=s.room_id 
              and r.id=a.room_id
              and r.id=b.room_id
              and r.user_id=${user_id}
              order by r.updatedAt desc
            limit ${skip},${take}`
    // console.log(response)
    return response
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
    res.status(200).json({ items: [], message: 'no Session' })
    return
  }
  const { skip, take } = req.query
  try {
    const items = await getManagedRooms(
      String(session.user?.id),
      Number(skip),
      Number(take)
    )
    res.status(200).json({ items: items, message: 'Success' })
  } catch (error) {
    res.status(400).json({ message: 'Failed' })
  }
}
