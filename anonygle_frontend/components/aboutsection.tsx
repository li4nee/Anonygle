import { Video, Users, Globe, Zap } from "lucide-react";

const stats = [
  { number: "1000+", label: "Active Users", icon: Users },
  { number: "195", label: "Countries", icon: Globe },
  { number: "24/7", label: "Available", icon: Zap },
  { number: "0", label: "Data Stored", icon: Video }
];

const AboutSection = () => {
  return (
    <section id="about" className="pt-2 pb-20 px-6 bg-background relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-float opacity-60" />
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-primary rounded-full animate-float opacity-40" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-primary rounded-full animate-float opacity-50" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-primary rounded-full animate-float opacity-30" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="mb-16">
          <div className="mb-8">
            <Video className="w-16 h-16 text-primary mx-auto mb-6 animate-pulse-slow glow-red" />
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-foreground">
              What is{" "}
              <span className="text-primary text-glow">Anonygle?</span>
            </h2>
          </div>
          
          <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            <p>
              <strong className="text-foreground">Anonygle</strong> is the worlds most secure anonymous video chat platform. 
              We believe in the power of human connection without compromising your privacy.
            </p>
            <p>
              In a digital world where every click is tracked and every conversation is monitored, 
              Anonygle offers a sanctuary for <span className="text-primary font-semibold">genuine, unfiltered human interaction</span>.
            </p>
            <p>
              Whether you are looking to practice a new language, share your thoughts with someone who truly listens, 
              or simply have a meaningful conversation with a stranger, Anonygle makes it possible—
              <span className="text-primary font-semibold"> safely and anonymously</span>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-4">
                <stat.icon className="w-8 h-8 text-primary mx-auto animate-pulse-slow" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2 text-glow">
                {stat.number}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;