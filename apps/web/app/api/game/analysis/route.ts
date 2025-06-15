import { prisma } from "db";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
   try {
      const body = await req.json();
      const game = await prisma.game.findUnique({
         where: {
            id: parseInt(body.gameId),
         },
         
         include:{
            moves:true,
            whitePlayer: true,
            blackPlayer: true,
            
         }
      });
      return NextResponse.json({game}, { status: 200 });
   } catch (e) {
      console.error("Error fetching game:", e);
      return NextResponse.json({ error: "Failed to fetch game" }, { status: 500 });
   }
};
