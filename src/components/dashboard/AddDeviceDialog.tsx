import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface AddDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editDevice?: any;
}

export const AddDeviceDialog = ({ open, onOpenChange, editDevice }: AddDeviceDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    device_name: "",
    phone_number: "",
    inactivity_threshold_hours: 24,
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (editDevice) {
      setFormData({
        device_name: editDevice.device_name,
        phone_number: editDevice.phone_number,
        inactivity_threshold_hours: editDevice.inactivity_threshold_hours,
        is_active: editDevice.is_active,
      });
    } else {
      setFormData({
        device_name: "",
        phone_number: "",
        inactivity_threshold_hours: 24,
        is_active: true,
      });
    }
  }, [editDevice, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (editDevice) {
        const { error } = await supabase
          .from("devices")
          .update(formData)
          .eq("id", editDevice.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Device updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("devices")
          .insert([{ ...formData, user_id: user.id }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Device added successfully",
        });
      }

      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editDevice ? "Edit Device" : "Add New Device"}</DialogTitle>
          <DialogDescription>
            Configure your monitoring device settings
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="device_name">Device Name</Label>
            <Input
              id="device_name"
              value={formData.device_name}
              onChange={(e) =>
                setFormData({ ...formData, device_name: e.target.value })
              }
              placeholder="Living Room Monitor"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData({ ...formData, phone_number: e.target.value })
              }
              placeholder="+1234567890"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inactivity_threshold_hours">
              Inactivity Threshold (hours)
            </Label>
            <Input
              id="inactivity_threshold_hours"
              type="number"
              min="1"
              max="168"
              value={formData.inactivity_threshold_hours}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  inactivity_threshold_hours: parseInt(e.target.value),
                })
              }
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Active</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : editDevice ? "Update Device" : "Add Device"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
