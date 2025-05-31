import { authOptions} from "../../../../lib/auth";
import NextAuth from "next-auth";


//@ts-ignore
const handler=NextAuth(authOptions);


export const GET = handler;
export const POST = handler;

