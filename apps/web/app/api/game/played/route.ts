import { prisma } from "db";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
   try {
      const { user_id } = await req.json();
      const games = await prisma.game.findMany({
         where: {
            OR: [
               { whitePlayerId: user_id },
               { blackPlayerId: user_id }
            ]
         },
         select:{
            id:true,
            status:true,
            winPlayerId: true,
            startAt: true,
            whitePlayer: {
               select: {
                  id: true,
                  name: true,
                  rating: true,
                  avatarUrl: true,
               }
            },
            blackPlayer: {
               select: {
                  id: true,
                  name: true,
                  rating: true,
                  avatarUrl: true,
               }
            },

         }
      })
      return NextResponse.json(games, { status: 200 });
   }
   catch(e)
   {
      console.error("Error fetching games:", e);
      return new Response("Internal Server Error", { status: 500 });
   }
}
