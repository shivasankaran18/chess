import { NextRequest, NextResponse } from "next/server";
import { prisma } from "db";

export const GET=async (req:NextRequest)=>{
   try{
      const games = await prisma.game.findMany({
         where: {
            status:"WAITING_FOR_PLAYER" 
         },
         select:{
            id: true,
            whitePlayer:{
               select:{
                  name: true,
                  rating: true,
                  avatarUrl: true,

               }
            }
         }
        
      })
      return NextResponse.json(games, { status: 200 });

   }
   catch(error){
      console.error("Error in GET route:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
   }


}
