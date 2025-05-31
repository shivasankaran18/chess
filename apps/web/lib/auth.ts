import GoogleProvider from "next-auth/providers/google";
import { prisma } from "db";
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
   providers: [
      GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID || "",
         clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      }),
      GitHubProvider({
         clientId: process.env.GITHUB_CLIENT_ID || "",
         clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      }),
   ],
   secret: process.env.NEXTAUTH_SECRET || "shiva-chess",
   callbacks: {
      async signIn({
         user,
         account,
         profile,
      }: {
         user: any;
         account: any;
         profile: any;
      }) {
         console.log("SignIn Callback");
         console.log(user);
         const res = await prisma.user.findUnique({
            where: {
               email: user.email,
            },
         });

         if (res) {
            user.id = res.id;
            return true;
         }

         const newUser = await prisma.user.create({
            data: {
               email: user.email,
               name: user.name,
               provider: "GOOGLE",
            },
         });
         user.id = newUser.id;
         return true;
      },
      async jwt({ token, user }: { token: any; user: any }) {
         console.log("JWT Callback");
         if (user) {
            token.id = user.id;
         }
         return token;
      },
      async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
         return `${baseUrl}/home`;
      },
      async session({
         session,
         token,
         user,
      }: {
         session: any;
         token: any;
         user: any;
      }) {
         session.user.id = token.id;
         return session;
      },
   },
   pages: {
      signIn: "/signin",
   },
};
