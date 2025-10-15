import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, MapPin } from "lucide-react";
import OpportunityCard from "./OpportunityCard";

const mockOpportunities = [
  {
    title: "Community Garden Volunteer",
    organization: "Green Earth Initiative",
    location: "Downtown Community Center",
    duration: "Weekends, 3 hours",
    category: "Environment",
    description: "Help maintain our community garden, teach children about sustainable growing, and distribute fresh produce to local families in need.",
    volunteersNeeded: 8,
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop"
  },
  {
    title: "Food Bank Assistant",
    organization: "City Food Bank",
    location: "Main Street Warehouse",
    duration: "Flexible, 2-4 hours",
    category: "Hunger Relief",
    description: "Sort donations, pack food boxes, and help distribute meals to families experiencing food insecurity in our community.",
    volunteersNeeded: 12,
    imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=300&fit=crop"
  },
  {
    title: "Reading Buddy Program",
    organization: "Literacy For All",
    location: "Central Library",
    duration: "Tuesdays, 1 hour",
    category: "Education",
    description: "Support children's literacy development by reading with elementary school students and helping with homework assistance.",
    volunteersNeeded: 6,
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop"
  },
  {
    title: "Senior Companion",
    organization: "ElderCare Connect",
    location: "Various locations",
    duration: "Weekly, 2 hours",
    category: "Senior Support",
    description: "Provide companionship to seniors, assist with errands, and help them stay connected with their community.",
    volunteersNeeded: 15,
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
  },
  {
    title: "Animal Shelter Helper",
    organization: "Paws & Hearts Rescue",
    location: "Animal Shelter",
    duration: "Flexible scheduling",
    category: "Animal Welfare",
    description: "Care for rescue animals, assist with adoptions, and help with shelter maintenance and special events.",
    volunteersNeeded: 10,
    imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop"
  },
  {
    title: "Youth Mentor",
    organization: "Future Leaders Program",
    location: "Youth Center",
    duration: "After school, 2 hours",
    category: "Youth Development",
    description: "Mentor at-risk youth, help with academic support, and lead enrichment activities to build confidence and life skills.",
    volunteersNeeded: 8,
    imageUrl: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=300&fit=crop"
  }
];

const OpportunityBrowser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const categories = ["All Categories", "Environment", "Hunger Relief", "Education", "Senior Support", "Animal Welfare", "Youth Development"];
  const locations = ["All Locations", "Downtown Community Center", "Main Street Warehouse", "Central Library", "Various locations", "Animal Shelter", "Youth Center"];

  const filteredOpportunities = mockOpportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || selectedCategory === "All Categories" || opportunity.category === selectedCategory;
    const matchesLocation = !selectedLocation || selectedLocation === "All Locations" || opportunity.location === selectedLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <section id="opportunities" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Find Your Perfect <span className="text-primary">Volunteer</span> Match
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover meaningful opportunities that align with your passions and schedule
          </p>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-elegant p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="default" className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
        
        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredOpportunities.length} of {mockOpportunities.length} opportunities
          </p>
        </div>
        
        {/* Opportunity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity, index) => (
            <OpportunityCard key={index} {...opportunity} />
          ))}
        </div>
        
        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No opportunities found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or check back later for new opportunities.</p>
          </div>
        )}
        
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Opportunities
          </Button>
        </div>
      </div>
    </section>
  );
};

export default OpportunityBrowser;