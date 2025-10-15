import { Button } from "@/components/ui/button";
import { Heart, Users, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-volunteers.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/60 to-secondary/70"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-4">
              <Heart className="w-12 h-12 text-secondary animate-pulse" />
              <Users className="w-12 h-12 text-white" />
              <MapPin className="w-12 h-12 text-secondary animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Make a <span className="text-secondary">Difference</span>
            <br />
            Where It Matters Most
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto leading-relaxed">
            Connect with meaningful volunteer opportunities in your community. 
            Find your perfect match and create lasting impact together.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => {
                document.getElementById('opportunities')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
            >
              Find Opportunities
            </Button>
            <Button 
              variant="community" 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => {
                // For now, scroll to opportunities. Later can be a dedicated org signup page
                document.getElementById('opportunities')?.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
            >
              Join as Organization
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="backdrop-blur-sm bg-white/10 rounded-lg p-6 border border-white/20">
              <div className="text-3xl font-bold text-secondary mb-2">5,000+</div>
              <div className="text-white/80">Active Volunteers</div>
            </div>
            <div className="backdrop-blur-sm bg-white/10 rounded-lg p-6 border border-white/20">
              <div className="text-3xl font-bold text-secondary mb-2">1,200+</div>
              <div className="text-white/80">Organizations</div>
            </div>
            <div className="backdrop-blur-sm bg-white/10 rounded-lg p-6 border border-white/20">
              <div className="text-3xl font-bold text-secondary mb-2">25,000+</div>
              <div className="text-white/80">Lives Impacted</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;