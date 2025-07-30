import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import Header from "../../components/header";
import HeroSection from "../../components/herosection";
// import FeaturesSection from "../../components/features";
import AboutSection from "../../components/aboutsection";
import ExtraFeaturesSection from "../../components/extraFeatures";
import ExtraSafetySection from "../../components/safetySection";
import Link from "next/link";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <HeroSection />
        <AboutSection />
        <ExtraFeaturesSection />
        <ExtraSafetySection />

        <section className="py-24 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to <span className="text-primary text-glow">Connect?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of people making meaningful connections every day.
              Your next great conversation is just one click away.
            </p>
            <Link href="/chat" className="inline-block">
              <Button
                size="lg"
                className="text-xl px-12 py-8 bg-primary hover:cursor-pointer hover:bg-primary/90 glow-red-strong hover:glow-red-strong transition-all duration-300 transform hover:scale-105"
              >
                Enter Chat Room
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-border/50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Video className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">Anonygle</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Connect. Chat. Stay Anonymous.
          </p>
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Community Guidelines
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
