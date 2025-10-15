import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Heart, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OpportunityCardProps {
  title: string;
  organization: string;
  location: string;
  duration: string;
  category: string;
  description: string;
  volunteersNeeded: number;
  imageUrl?: string;
}

const OpportunityCard = ({
  title,
  organization,
  location,
  duration,
  category,
  description,
  volunteersNeeded,
  imageUrl,
}: OpportunityCardProps) => {
  const [isApplied, setIsApplied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const { toast } = useToast();

  const handleApply = () => {
    if (!isApplied) {
      setIsApplied(true);
      toast({
        title: "Application Submitted! 🎉",
        description: `Your interest in "${title}" has been sent to ${organization}. They'll contact you soon!`,
      });
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removed from favorites" : "Added to favorites! ❤️",
      description: isFavorited ? 
        `"${title}" removed from your saved opportunities.` :
        `"${title}" saved to your favorites for later.`,
    });
  };
  return (
    <Card className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 border-border/50">
      {/* Image */}
      {imageUrl && (
        <div className="relative overflow-hidden rounded-t-lg h-48">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`bg-white/90 hover:bg-white transition-colors ${
                isFavorited ? 'text-secondary' : 'text-primary'
              }`}
              onClick={handleFavorite}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            {category}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-1" />
            {volunteersNeeded} needed
          </div>
        </div>
        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground font-medium">{organization}</p>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            {location}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="w-4 h-4 mr-2 text-primary" />
            {duration}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          className="w-full" 
          variant={isApplied ? "secondary" : "default"}
          onClick={handleApply}
          disabled={isApplied}
        >
          {isApplied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Applied
            </>
          ) : (
            "Apply Now"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OpportunityCard;