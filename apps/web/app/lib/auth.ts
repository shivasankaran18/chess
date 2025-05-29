
import GoogleProvider from "next-auth/providers/google";
import {prisma} from "db"

export const authOptions = {
   providers: [
      GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID || "",
         clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      }),
   ],
   secret:process.env.NEXTAUTH_SECRET,
   callbacks:{
      async signin({user, account, profile}:{
         user: any;
         account: any;
         profile: any;
      }) {

         const res=await prisma.user.findUnique({
            where: {
               email: user.email,
            },
         });

         if(res)
         {
            user.id=res.id;
            return true;
         }

         const newUser=await prisma.user.create({
            data:{
               email: user.email,
               name: user.name,
               provider:"GOOGLE",
               
            }
         });
         user.id=newUser.id;
         return true;
            


         
      }
   }


}
