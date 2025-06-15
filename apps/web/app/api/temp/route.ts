import { NextRequest, NextResponse } from "next/server";
import {prisma} from "db";
export const GET=async (req: NextRequest) => {
   await prisma.move.deleteMany({
      where: {
         gameId: {
            notIn: [14,]
         }
      }
   })
   await prisma.game.deleteMany({
      where:{
         id:{
            notIn:[14,]
         }
      }
   });
   return new NextResponse("Hello from GET route");
}
