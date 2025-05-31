import { cn } from "@/lib/utils";
import { ChevronRight as ChessKnight } from "lucide-react";

interface ChessLogoProps {
  className?: string;
}

export function ChessLogo({ className }: ChessLogoProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-40 rounded-full"></div>
      <div className="relative bg-black p-4 rounded-full border-4 border-emerald-500 shadow-lg shadow-emerald-900/20">
        <ChessKnight className="w-full h-full text-emerald-500" strokeWidth={1.5} />
      </div>
    </div>
  );
}
