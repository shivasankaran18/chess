import { NextRequest, NextResponse } from "next/server";
import {prisma} from "db";
export const GET=async (req: NextRequest) => {
   await prisma.user.deleteMany({});
   return new NextResponse("Hello from GET route");
}
