import { Shield, Eye, UserX, AlertTriangle, Lock, Heart } from "lucide-react";

const safetyFeatures = [
  {
    icon: Eye,
    title: "Complete Anonymity",
    description:
      "No usernames, emails, or personal information required. Stay completely anonymous.",
  },
  {
    icon: UserX,
    title: "Instant Blocking",
    description:
      "Block inappropriate users immediately with a single click. Your safety comes first.",
  },
  {
    icon: AlertTriangle,
    title: "Smart Reporting",
    description:
      "Advanced AI helps detect and prevent harmful behavior before it escalates.",
  },
];

const ExtraSafetySection = () => {
  return (
    <section
      id="safety"
      className="py-24 px-6 bg-secondary/30 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute inset-0 gradient-mesh" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Main Header */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <Shield className="w-20 h-20 text-primary mx-auto mb-6 animate-float glow-red" />
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Your Safety is Our{" "}
              <span className="text-primary text-glow">Priority</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              In a world where privacy is precious, we have built the most
              secure anonymous chat platform. Connect freely, knowing your
              identity and conversations are completely protected.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {safetyFeatures.map((feature, index) => (
            <div
              key={index}
              className="text-center bg-card/50 backdrop-blur-sm rounded-lg p-8 border border-border/50 hover:bg-card/80 hover:glow-red transition-all duration-300"
            >
              <div className="mb-6">
                <div className="p-4 rounded-full bg-primary/20 inline-flex animate-pulse-slow">
                  <feature.icon className="w-10 h-10 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse-slow" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              End-to-End Encryption
            </h3>
            <p className="text-muted-foreground">
              Military-grade security for all conversations
            </p>
          </div>
          <div className="text-center">
            <Heart className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse-slow" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Zero Tolerance Policy
            </h3>
            <p className="text-muted-foreground">
              Immediate action against harassment or abuse
            </p>
          </div>
          <div className="text-center">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse-slow" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              No Data Collection
            </h3>
            <p className="text-muted-foreground">
              We do not store, track, or sell your information
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExtraSafetySection;
