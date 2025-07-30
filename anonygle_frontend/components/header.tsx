import { Button } from "@/components/ui/button";
import { Video, Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Video className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold">Anonygle</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#safety"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Safety
          </a>
          <a
            href="#about"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <Button size="sm" className="bg-primary hover:bg-primary/90 glow-red">
            Start Chat
          </Button>
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
