import { Card, CardContent } from "@/components/ui/card";
import { Video, Shield, Globe, Zap, Users, Lock } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "Anonymous Video Chat",
    description:
      "Connect face-to-face with strangers while keeping your identity completely private.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "No registration required. Your conversations are not stored or monitored.",
  },
  {
    icon: Globe,
    title: "Global Connections",
    description:
      "Meet people from around the world and break down cultural barriers.",
  },
  {
    icon: Zap,
    title: "Instant Matching",
    description:
      "Get paired with someone new in seconds with our fast matching algorithm.",
  },
  {
    icon: Users,
    title: "Safe Community",
    description:
      "Report inappropriate behavior instantly with our one-click reporting system.",
  },
  {
    icon: Lock,
    title: "Secure Platform",
    description:
      "End-to-end encryption ensures your conversations remain private and secure.",
  },
];

const ExtraFeaturesSection = () => {
  return (
    <section id="features" className="py-24 px-6 bg-background relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Why Choose{" "}
            <span className="text-primary text-glow animate-pulse-slow">
              Anonygle?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Experience the future of anonymous connections with cutting-edge
            features designed for privacy, safety, and meaningful conversations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-card/80 border-border backdrop-blur-sm hover:bg-card transition-all duration-300 hover:glow-red group cursor-pointer"
            >
              <CardContent className="p-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div
                    className="p-4 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-all duration-300 animate-float"
                    style={{ animationDelay: `${index * 0.5}s` }}
                  >
                    <feature.icon className="w-8 h-8 text-primary group-hover:animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-card-foreground group-hover:text-primary transition-colors duration-300">
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

export default ExtraFeaturesSection;
