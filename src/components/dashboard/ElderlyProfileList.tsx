import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Phone, MapPin, Clock, Settings, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import ContactList from "./ContactList";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ElderlyProfile {
  id: string;
  full_name: string;
  age: number | null;
  address: string | null;
  medical_notes: string | null;
  inactivity_threshold_hours: number;
  last_activity_at: string | null;
  status: string;
}

export default function ElderlyProfileList() {
  const [profiles, setProfiles] = useState<ElderlyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProfiles, setExpandedProfiles] = useState<Set<string>>(new Set());

  const toggleProfile = (profileId: string) => {
    setExpandedProfiles((prev) => {
      const next = new Set(prev);
      if (next.has(profileId)) {
        next.delete(profileId);
      } else {
        next.add(profileId);
      }
      return next;
    });
  };

  useEffect(() => {
    fetchProfiles();

    const channel = supabase
      .channel("elderly_profiles_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "elderly_profiles" },
        () => {
          fetchProfiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("elderly_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">Loading profiles...</div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No individuals added yet</h3>
        <p className="text-muted-foreground mb-4">
          Start monitoring by adding your first elderly family member
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {profiles.map((profile) => {
        const isExpanded = expandedProfiles.has(profile.id);
        return (
          <Card key={profile.id} className="p-4">
            <Collapsible open={isExpanded} onOpenChange={() => toggleProfile(profile.id)}>
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{profile.full_name}</h3>
                      {profile.age && (
                        <Badge variant="secondary">{profile.age} years</Badge>
                      )}
                      <Badge variant={profile.status === "active" ? "default" : "secondary"}>
                        {profile.status}
                      </Badge>
                    </div>
                    {profile.address && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {profile.address}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Alert after {profile.inactivity_threshold_hours}h
                      </div>
                      {profile.last_activity_at && (
                        <div>
                          Last activity:{" "}
                          {formatDistanceToNow(new Date(profile.last_activity_at), {
                            addSuffix: true,
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
              
              <CollapsibleContent className="mt-4 pt-4 border-t">
                <ContactList elderlyProfileId={profile.id} />
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}