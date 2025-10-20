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
  editPhoneNumber?: any;
}

export const AddDeviceDialog = ({ open, onOpenChange, editPhoneNumber }: AddDeviceDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    phone_number: "",
    no_contact_period: 24, // hours in UI, convert to interval in SQL
    active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (editPhoneNumber) {
      setFormData({
        location: editPhoneNumber.location,
        phone_number: editPhoneNumber.phone_number,
        no_contact_period: editPhoneNumber.no_contact_period
          ? typeof editPhoneNumber.no_contact_period === "number"
            ? editPhoneNumber.no_contact_period
            : parseInt(editPhoneNumber.no_contact_period)
          : 24,
        active: editPhoneNumber.active,
      });
    } else {
      setFormData({
        location: "",
        phone_number: "",
        no_contact_period: 24,
        active: true,
      });
    }
  }, [editPhoneNumber, open]);

  // Converts hours as number to a Postgres interval string
  const hoursToInterval = (hours: number) => `${hours}:00:00`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const payload = {
        user_id: user.id,
        phone_number: formData.phone_number,
        location: formData.location,
        no_contact_period: hoursToInterval(formData.no_contact_period),
        active: formData.active,
      };

      if (editPhoneNumber) {
        const { error } = await supabase
          .from("phone_numbers_cp141")
          .update(payload)
          .eq("id", editPhoneNumber.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Phone details updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("phone_numbers_cp141")
          .insert([{ ...payload, created_at: new Date().toISOString() }]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Phone details added successfully",
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
          <DialogTitle>{editPhoneNumber ? "Edit Phone" : "Add Phone"}</DialogTitle>
          <DialogDescription>
            Configure your phone number and location for monitoring
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location Name</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Living Room, Kitchen, etc."
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
            <Label htmlFor="no_contact_period">Inactivity Threshold (hours)</Label>
            <Input
              id="no_contact_period"
              type="number"
              min="1"
              max="168"
              value={formData.no_contact_period}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  no_contact_period: parseInt(e.target.value),
                })
              }
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="active">Active</Label>
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, active: checked })
              }
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : editPhoneNumber ? "Update Phone" : "Add Phone"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

