import { Button } from "@/components/ui/button";
import { Menu, User } from "lucide-react";
import psaLogo from "@/assets/psa-logo.jpeg";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={psaLogo} alt="PSA Logo" className="w-12 h-12 object-contain" />
            <span className="text-xl font-bold text-primary">PSA System</span>
          </div>
          
          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-foreground hover:text-primary transition-colors"
            >
              Browse Opportunities
            </button>
            <button 
              onClick={() => document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-foreground hover:text-primary transition-colors"
            >
              Organizations
            </button>
            <button 
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-foreground hover:text-primary transition-colors"
            >
              How It Works
            </button>
            <button 
              onClick={() => document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-foreground hover:text-primary transition-colors"
            >
              Contact
            </button>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Started
            </Button>
            
            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;