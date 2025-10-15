import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, Heart, Users, Award } from "lucide-react";
import communityImage from "@/assets/community-hands.jpg";

const steps = [
  {
    icon: Search,
    title: "Discover Opportunities",
    description: "Browse volunteer opportunities that match your interests, skills, and availability in your local community."
  },
  {
    icon: Heart,
    title: "Apply & Connect",
    description: "Apply for opportunities that resonate with you and connect directly with organizations that need your help."
  },
  {
    icon: Users,
    title: "Make an Impact",
    description: "Join fellow volunteers in making a real difference while building meaningful connections and gaining new experiences."
  },
  {
    icon: Award,
    title: "Track Your Journey",
    description: "Keep track of your volunteer hours, impact, and recognition while building a portfolio of your community service."
  }
];

const HowItWorks = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            How <span className="text-primary">VolunteerConnect</span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Making volunteering accessible, meaningful, and rewarding for everyone
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="order-2 lg:order-1">
            <img
              src={communityImage}
              alt="Community volunteering"
              className="rounded-lg shadow-elegant w-full h-auto"
            />
          </div>
          
          <div className="order-1 lg:order-2 space-y-8">
            {steps.map((step, index) => (
              <Card key={index} className="border-border/50 hover:shadow-warm transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground pl-16">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="bg-gradient-subtle rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-foreground mb-2">
              Creating Real Impact Together
            </h3>
            <p className="text-muted-foreground text-lg">
              Join thousands of volunteers making a difference every day
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">250K+</div>
              <div className="text-muted-foreground">Volunteer Hours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">500+</div>
              <div className="text-muted-foreground">Partner Organizations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-muted-foreground">People Helped</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">95%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
          
          <div className="text-center">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Your Volunteer Journey
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;