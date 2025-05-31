import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

export function ModeToggle({theme,setTheme}:{theme:string,setTheme:(theme:string)=>void}) {
   return (
      <Button
         variant="outline"
         size="icon"
         className="absolute top-4 right-4"
         onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
         {theme === "dark" ? (
            <Sun className="h-5 w-5" />
         ) : (
            <Moon className="h-5 w-5" />
         )}
         <span className="sr-only">Toggle theme</span>
      </Button>
   );
}
