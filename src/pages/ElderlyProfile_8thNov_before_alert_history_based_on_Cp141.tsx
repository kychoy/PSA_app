import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Activity, Clock, Smartphone } from "lucide-react";
import ContactList from "@/components/dashboard/ContactList";
import AlertHistory from "@/components/dashboard/AlertHistory";

interface PhoneProfileData {
  id: string;
  user_id: string;
  location: string;
  phone_number: string;
  last_activity_at: string | null;
  no_contact_period: string;
  active: boolean;
  status: string;
  created_at: string;
}

const intervalToHours = (interval: string) => {
  if (!interval) return "N/A";
  const parts = interval.split(":");
  return parseInt(parts[0], 10);
};

const PhoneProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<PhoneProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("phone_numbers_cp141")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading profile",
        description: error.message,
      });
      navigate("/dashboard");
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const getActivityStatus = () => {
    if (!profile || !profile.last_activity_at) {
      return { status: "unknown", color: "text-gray-500", message: "No activity recorded" };
    }
    const lastActivity = new Date(profile.last_activity_at);
    const now = new Date();
    const hoursSince = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    const threshold = intervalToHours(profile.no_contact_period);
    if (hoursSince < threshold) {
      return { status: "active", color: "text-green-500", message: "Active recently" };
    } else {
      return {
        status: "inactive",
        color: "text-red-500",
        message: `Inactive for ${Math.floor(hoursSince)}h`
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto p-4 md:p-6">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const activityStatus = getActivityStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-2xl md:max-w-4xl mx-auto p-2 md:p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4 md:mb-6"
          size="sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="space-y-4 md:space-y-6">
          {/* Device Info */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between md:mb-2">
                <div>
                  <CardTitle className="text-lg md:text-2xl">{profile.location}</CardTitle>
                  <CardDescription className="text-sm md:text-base break-all">
                    {profile.phone_number}
                  </CardDescription>
                </div>
                <div className={`text-2xl md:text-3xl mt-2 md:mt-0 ${activityStatus.color}`}>
                  <Activity className="w-6 h-6 md:w-8 md:h-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {/* Activity status */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Activity Status: </span>
                    <span className={activityStatus.color}>{activityStatus.message}</span>
                  </div>
                </div>

                {profile.last_activity_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Last Activity: </span>
                      <span className="text-muted-foreground">
                        {new Date(profile.last_activity_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Alert Threshold: </span>
                    <span className="text-muted-foreground">
                      {intervalToHours(profile.no_contact_period)} hours
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Status: </span>
                    <span className="text-muted-foreground">
                      {profile.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contacts */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Emergency Contacts</CardTitle>
              <CardDescription>
                Manage contacts who will be alerted if prolonged inactivity is detected
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactList userId={profile.user_id} />
            </CardContent>
          </Card>

          {/* Alert History */}
          <Card className="w-full overflow-x-auto">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Alert History</CardTitle>
              <CardDescription>
                View all alerts sent to emergency contacts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertHistory userId={profile.user_id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PhoneProfile;


