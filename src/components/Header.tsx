import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, User, X } from "lucide-react";
import psaLogo from "@/assets/psa-logo.jpeg";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Shared menu items
  const MenuLinks = () => (
    <>
      <button
        onClick={() => {
          setMobileMenuOpen(false);
          document.getElementById("opportunities")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="text-foreground hover:text-primary transition-colors w-full text-left py-2"
      >
        Browse Opportunities
      </button>
      <button
        onClick={() => {
          setMobileMenuOpen(false);
          document.getElementById("opportunities")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="text-foreground hover:text-primary transition-colors w-full text-left py-2"
      >
        Organizations
      </button>
      <button
        onClick={() => {
          setMobileMenuOpen(false);
          document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="text-foreground hover:text-primary transition-colors w-full text-left py-2"
      >
        How It Works
      </button>
      <button
        onClick={() => {
          setMobileMenuOpen(false);
          document.getElementById("opportunities")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="text-foreground hover:text-primary transition-colors w-full text-left py-2"
      >
        Contact
      </button>
    </>
  );

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
            <MenuLinks />
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
              onClick={() =>
                document.getElementById("opportunities")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Get Started
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute top-0 right-0 w-3/4 max-w-xs h-full bg-white shadow-lg flex flex-col p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold text-primary">PSA System</span>
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <MenuLinks />
            <div className="mt-4">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button
                variant="default"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  setMobileMenuOpen(false);
                  document.getElementById("opportunities")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
