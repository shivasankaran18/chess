import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export default async function Home() {
   const session = await getServerSession(authOptions);

   return (
      <div className="dark:bg-white h-screen text-black">
         {JSON.stringify(session?.user)}
         Home
      </div>
   );
}
