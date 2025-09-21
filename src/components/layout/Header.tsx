import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

export default function Header() {
  return (
    <header className="h-12 bg-[#121315] border-b border-white/10 flex items-center justify-between px-3 py-3">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white/80 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="p-0 bg-[#17181B] border-white/10"
          >
            <Sidebar />
          </SheetContent>
        </Sheet>
        <span className="hidden md:block text-white/70 text-xs">
          Latest version: v1
        </span>
      </div>
    </header>
  );
}
