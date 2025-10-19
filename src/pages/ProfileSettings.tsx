import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User } from "lucide-react";

interface ProfileData {
  full_name: string;
  email: string;
  phone_number: string | null;
  notification_method: string[]; // Now expecting an array of strings
}

const NOTIFICATION_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "voice", label: "Voice Call" },
];

const ProfileSettings = () => {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    email: "",
    phone_number: "",
    notification_method: [],
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      const { data, error } = await supabase
        .from("users")
        .select("full_name, email, phone_number, notification_method")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfileData({
        full_name: data.full_name || "",
        email: data.email || "",
        phone_number: data.phone_number || "",
        notification_method: Array.isArray(data.notification_method) ? data.notification_method : [],
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile data",
      });
    }
  };

  const handleNotificationChange = (method: string) => {
    setProfileData((prev) => {
      const current = prev.notification_method || [];
      if (current.includes(method)) {
        return { ...prev, notification_method: current.filter((m) => m !== method) };
      } else {
        return { ...prev, notification_method: [...current, method] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("users")
        .update({
          full_name: profileData.full_name,
          phone_number: profileData.phone_number || null,
          notification_method: profileData.notification_method,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your account information and alert preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, full_name: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={profileData.phone_number || ""}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone_number: e.target.value })
                  }
                  placeholder="+1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label>Preferred Alert Methods</Label>
                <div className="flex flex-col gap-2">
                  {NOTIFICATION_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={opt.value}
                        checked={profileData.notification_method.includes(opt.value)}
                        onChange={() => handleNotificationChange(opt.value)}
                        className="accent-primary"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Choose all that apply for receiving alerts
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSettings;
