
import { Card, CardContent } from "@/components/ui/card";
import { Video, Share2, Shuffle, Globe } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Anonymous Video Chat",
    description: "Connect face-to-face with strangers while keeping your identity private. No registration required."
  },
  {
    icon: Share2,
    title: "Screen Sharing",
    description: "Share your screen to show videos, games, or anything else. Perfect for collaborative experiences."
  },
  {
    icon: Shuffle,
    title: "Random Matching",
    description: "Our algorithm instantly pairs you with interesting people from around the globe."
  },
  {
    icon: Globe,
    title: "Global Friend-Making",
    description: "Break down barriers and connect with people from different cultures and backgrounds."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Why Choose{" "}
            <span className="text-primary text-glow">Anonygle?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the future of anonymous connections with cutting-edge features designed for privacy and fun.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-card/50 border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300 hover:glow-red group cursor-pointer"
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors duration-300">
                    <feature.icon className="w-8 h-8 text-primary group-hover:animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;