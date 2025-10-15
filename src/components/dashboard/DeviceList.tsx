import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Smartphone, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddDeviceDialog } from "./AddDeviceDialog";
import { Badge } from "@/components/ui/badge";

interface Device {
  id: string;
  device_name: string;
  phone_number: string;
  inactivity_threshold_hours: number;
  is_active: boolean;
  created_at: string;
}

export const DeviceList = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("devices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load devices",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("devices")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Device deleted successfully",
      });
      loadDevices();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete device",
      });
    }
  };

  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingDevice(null);
    loadDevices();
  };

  if (loading) {
    return <div>Loading devices...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Devices</h2>
          <p className="text-muted-foreground">Manage your monitoring devices</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Device
        </Button>
      </div>

      {devices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No devices yet. Add your first monitoring device to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <Card key={device.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{device.device_name}</CardTitle>
                  </div>
                  <Badge variant={device.is_active ? "default" : "secondary"}>
                    {device.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription>{device.phone_number}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Inactivity threshold: {device.inactivity_threshold_hours} hours
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(device)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(device.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddDeviceDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        editDevice={editingDevice}
      />
    </div>
  );
};
