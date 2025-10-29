import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, User, LogOut, Activity, AlertCircle, Clock, Smartphone, CheckCircle } from "lucide-react";
import { AddDeviceDialog } from "@/components/dashboard/AddDeviceDialog";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import psaLogo from "@/assets/psa-logo.jpeg";

interface PhoneProfile {
  id: string;
  user_id: string;
  phone_number: string;
  created_at: string;
  no_contact_period: string;
  location: string;
  active: boolean;
  last_activity_at: string | null;
}

interface DBUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone_number: string;
  no_contact_period: string;
  created_at: string;
  updated_at: string;
  notification_method: string;
}

const intervalToHours = (interval: string) => {
  if (!interval) return "N/A";
  const parts = interval.split(":");
  return parseInt(parts[0], 10);
};

const Dashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [devices, setDevices] = useState<PhoneProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate("/auth");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // When user is set, fetch dbUser and then devices
  useEffect(() => {
    if (user) {
      fetchDbUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // After dbUser info is loaded, fetch devices
  useEffect(() => {
    if (dbUser && user) {
      loadDevices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbUser]);

  // Fetch db user from users table
  const fetchDbUser = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();
    if (error) {
      toast({
        variant: "destructive",
        title: "Could not load user profile",
        description: error.message,
      });
      setDbUser(null);
    } else {
      setDbUser(data);
    }
  };

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const loadDevices = async () => {
    setLoading(true);
    if (!user) {
      setDevices([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("phone_numbers_cp141")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading devices",
        description: error.message,
      });
    } else {
      setDevices(data || []);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  // Test button
  const handleTestWebhook = async () => {
    setTestLoading(true);
    try {
      const res = await fetch("https://n8n.vocahk.com/webhook/6be3ae5f-45c2-4c12-b410-2e1fb4cdedc3", {
        method: "POST",
      });
      if (res.ok) {
        toast({ title: "Test webhook triggered!", description: "Webhook executed successfully." });
      } else {
        toast({ variant: "destructive", title: "Webhook error", description: "Failed to trigger webhook." });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Webhook error", description: String(err) });
    } finally {
      setTestLoading(false);
    }
  };

  // Last activity formatting
  const getLastActivityLabel = (device: PhoneProfile) => {
    if (!device.last_activity_at) return "No activity recorded";
    const dateObj = new Date(device.last_activity_at);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60));
    return `Last activity: ${dateObj.toLocaleString()} (${diffHours}h ago)`;
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
            <h2 className="text-3xl font-bold">Monitored Devices</h2>
            <p className="text-muted-foreground mt-1">
              Manage and monitor device phone numbers and locations for inactivity
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
            {dbUser && dbUser.role === "super" && (
              <Button
                variant="secondary"
                onClick={handleTestWebhook}
                disabled={testLoading}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {testLoading ? "Testing..." : "Test"}
              </Button>
            )}
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading devices...</p>
          </div>
        ) : devices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No devices yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first device to start monitoring
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Device
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => {
              return (
                <Card
                  key={device.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/profile/${device.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{device.location}</CardTitle>
                        <CardDescription>
                          {device.phone_number}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className={`text-2xl ${device.active ? "text-green-500" : "text-red-500"}`}>
                          <Activity className="w-6 h-6" />
                        </div>
                        <div className="mt-1 text-xs font-semibold">
                          {device.active ? (
                            <span className="text-green-600 flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="text-red-500 flex items-center">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {getLastActivityLabel(device)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Alert threshold: {intervalToHours(device.no_contact_period)}h
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <AddDeviceDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onSuccess={user ? loadDevices : undefined}
      />
    </div>
  );
};

export default Dashboard;
