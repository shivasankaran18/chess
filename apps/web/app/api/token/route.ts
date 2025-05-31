import { authOptions } from "@/lib/auth";
import { NextApiRequest } from "next";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";


export const GET=async(req:NextRequest)=>{
   const session=await getServerSession(authOptions);
   if(!session)
   {
      return new Response("Unauthorized", { status: 401 });
   }
   //@ts-ignore
   const token=getToken(req,process.env.NEXTAUTH_SECRET || "shiva-chess");
   return NextResponse.json({
      token: token,
   });

}
