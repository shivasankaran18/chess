import { authOptions } from "@/app/lib/auth";
import NextAuth from "next-auth";


//@ts-ignore
const handler=NextAuth(authOptions);


export const GET = handler;
export const POST = handler;

