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

// ...all imports remain unchanged (as in your original)

const Dashboard = () => {
  // ...all hooks and logic unchanged

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-2 sm:px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <img src={psaLogo} alt="PSA Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            <h1 className="text-lg sm:text-xl font-bold">Prolonged Stay Alert</h1>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/devices")} className="w-full sm:w-auto">
              <Smartphone className="w-4 h-4 mr-1 sm:mr-2" />
              Devices
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="w-full sm:w-auto">
              <User className="w-4 h-4 mr-1 sm:mr-2" />
              Profile
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full sm:w-auto">
              <LogOut className="w-4 h-4 mr-1 sm:mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-2 sm:px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold">Monitored Devices</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage and monitor device phone numbers and locations for inactivity
            </p>
          </div>
          <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={() => setShowAddDialog(true)} className="w-full xs:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
            {dbUser && dbUser.role === "super" && (
              <Button
                variant="secondary"
                onClick={handleTestWebhook}
                disabled={testLoading}
                className="w-full xs:w-auto"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {testLoading ? "Testing..." : "Test"}
              </Button>
            )}
          </div>
        </div>
        {loading ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Loading devices...</p>
          </div>
        ) : devices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 px-2 sm:py-16">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mb-4" />
              <h3 className="text-base sm:text-xl font-semibold mb-2">No devices yet</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Add your first device to start monitoring
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add First Device
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {devices.map((device) => (
              <Card
                key={device.id}
                className="hover:shadow-lg transition-shadow cursor-pointer px-3 py-4 sm:p-6 w-full"
                onClick={() => navigate(`/profile/${device.id}`)}
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="w-full flex flex-col gap-1">
                      <CardTitle className="text-base sm:text-xl">{device.location}</CardTitle>
                      <CardDescription className="text-xs sm:text-base break-all">
                        {device.phone_number}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`text-xl sm:text-2xl ${device.active ? "text-green-500" : "text-red-500"}`}>
                        <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
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
                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {getLastActivityLabel(device)}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Alert threshold: {intervalToHours(device.no_contact_period)}h
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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

