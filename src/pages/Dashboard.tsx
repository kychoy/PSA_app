import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, User, LogOut, Activity, AlertCircle, Clock, Smartphone } from "lucide-react";
import { AddElderlyDialog } from "@/components/dashboard/AddElderlyDialog";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import psaLogo from "@/assets/psa-logo.jpeg";

interface ElderlyProfile {
  id: string;
  full_name: string;
  age: number | null;
  last_activity_at: string | null;
  inactivity_threshold_hours: number;
  status: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profiles, setProfiles] = useState<ElderlyProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
    await loadProfiles();
  };

  const loadProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("elderly_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading profiles",
        description: error.message,
      });
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const getActivityStatus = (profile: ElderlyProfile) => {
    if (!profile.last_activity_at) return { status: "unknown", color: "text-gray-500", message: "No activity recorded" };
    
    const lastActivity = new Date(profile.last_activity_at);
    const now = new Date();
    const hoursSince = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
    
    if (hoursSince < profile.inactivity_threshold_hours) {
      return { status: "active", color: "text-green-500", message: "Active recently" };
    } else {
      return { status: "inactive", color: "text-red-500", message: `Inactive for ${Math.floor(hoursSince)}h` };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={psaLogo} alt="PSA Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-xl font-bold">Prolonged Stay Alert</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="text-sm">{user?.email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/devices")}
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Devices
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/profile")}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Monitored Individuals</h2>
            <p className="text-muted-foreground mt-1">
              Manage and monitor elderly individuals for inactivity
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Person
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading profiles...</p>
          </div>
        ) : profiles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No profiles yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first elderly profile to start monitoring
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Person
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => {
              const activityStatus = getActivityStatus(profile);
              return (
                <Card
                  key={profile.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/profile/${profile.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{profile.full_name}</CardTitle>
                        <CardDescription>
                          {profile.age ? `${profile.age} years old` : "Age not specified"}
                        </CardDescription>
                      </div>
                      <div className={`text-2xl ${activityStatus.color}`}>
                        <Activity className="w-6 h-6" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className={activityStatus.color}>
                          {activityStatus.message}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Alert threshold: {profile.inactivity_threshold_hours}h
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <AddElderlyDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onSuccess={loadProfiles}
      />
    </div>
  );
};

export default Dashboard;