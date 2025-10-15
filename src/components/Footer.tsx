import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">VolunteerConnect</span>
            </div>
            <p className="text-primary-foreground/80">
              Connecting passionate volunteers with meaningful opportunities to create lasting positive impact in communities worldwide.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-primary-foreground/60 hover:text-secondary cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-primary-foreground/60 hover:text-secondary cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-primary-foreground/60 hover:text-secondary cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-primary-foreground/60 hover:text-secondary cursor-pointer transition-colors" />
            </div>
          </div>
          
          {/* For Volunteers */}
          <div>
            <h3 className="font-semibold text-lg mb-4">For Volunteers</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#" className="hover:text-secondary transition-colors">Browse Opportunities</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Create Profile</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Track Hours</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Get Certified</a></li>
            </ul>
          </div>
          
          {/* For Organizations */}
          <div>
            <h3 className="font-semibold text-lg mb-4">For Organizations</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#" className="hover:text-secondary transition-colors">Post Opportunities</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Manage Volunteers</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Resources</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">Success Stories</a></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Get in Touch</h3>
            <div className="space-y-3 text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>hello@volunteerconnect.org</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>123 Community St, City, State 12345</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
          <p>&copy; 2024 VolunteerConnect. All rights reserved. Built with ❤️ for communities everywhere.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;