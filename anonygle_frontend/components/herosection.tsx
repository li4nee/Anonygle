import { Button } from "@/components/ui/button";
import { Video, Play } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh">
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-float opacity-60" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-primary rounded-full animate-float opacity-40" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-primary rounded-full animate-float opacity-50" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-primary rounded-full animate-float opacity-30" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Video className="w-8 h-8 text-primary animate-pulse-slow" />
          <h1 className="text-4xl md:text-5xl font-bold text-glow">
            Anonygle
          </h1>
        </div>

        <div className="mb-12 space-y-4">
          <h2 className="text-5xl md:text-7xl font-bold leading-tight">
            Feeling{" "}
            <span className="text-primary text-glow animate-pulse-slow">
              lonely?
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Connect with strangers around the world.{" "}
            <span className="text-foreground font-semibold">Talk.</span>{" "}
            <span className="text-foreground font-semibold">Laugh.</span>{" "}
            <span className="text-foreground font-semibold">Share your screen.</span>{" "}
            <span className="text-foreground font-semibold">Make friends.</span>{" "}
            <span className="text-primary">Be anonymous.</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 glow-red-strong hover:glow-red-strong transition-all duration-300 transform hover:scale-105 group"
          >
            <Play className="w-6 h-6 mr-2 group-hover:animate-pulse" />
            Start Chatting
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg px-8 py-6 border-primary/50 text-primary hover:bg-primary/10 hover:border-primary transition-all duration-300"
          >
            Learn More
          </Button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
