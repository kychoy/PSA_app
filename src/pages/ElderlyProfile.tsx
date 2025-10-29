import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Activity, Clock, Smartphone } from "lucide-react";
import ContactList from "@/components/dashboard/ContactList";
import AlertHistory from "@/components/dashboard/AlertHistory";

// Table: phone_numbers_cp141
interface PhoneProfileData {
  id: string;
  user_id: string; // <-- Add this
  location: string;
  phone_number: string;
  last_activity_at: string | null;
  no_contact_period: string; // interval, e.g. "24:00:00"
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
        <div className="container mx-auto p-6">
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
      <div className="container mx-auto p-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{profile.location}</CardTitle>
                  <CardDescription>
                    {profile.phone_number}
                  </CardDescription>
                </div>
                <div className={`text-3xl ${activityStatus.color}`}>
                  <Activity className="w-8 h-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Activity Status</p>
                    <p className={`text-sm ${activityStatus.color}`}>
                      {activityStatus.message}
                    </p>
                  </div>
                </div>

                {profile.last_activity_at && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Last Activity</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(profile.last_activity_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Alert Threshold</p>
                    <p className="text-sm text-muted-foreground">
                      {intervalToHours(profile.no_contact_period)} hours
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.active ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
              <CardDescription>
                Manage contacts who will be alerted if prolonged inactivity is detected
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Key fix: pass userId, not phoneProfileId */}
              <ContactList userId={profile.user_id} />
            </CardContent>
          </Card>

         <Card>
  <CardHeader>
    <CardTitle>Alert History</CardTitle>
    <CardDescription>
      View all alerts sent to emergency contacts
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* OLD: <AlertHistory phoneProfileId={profile.id} /> */}
    <AlertHistory userId={profile.user_id} />
  </CardContent>
</Card>

        </div>
      </div>
    </div>
  );
};

export default PhoneProfile;

