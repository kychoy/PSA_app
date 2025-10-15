import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface AddElderlyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddElderlyDialog({ open, onOpenChange, onSuccess }: AddElderlyDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: "",
    age: "",
    address: "",
    medical_notes: "",
    inactivity_threshold_hours: "24",
    device_id: "",
    device_phone_number: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("elderly_profiles").insert({
        caregiver_id: user.id,
        full_name: formData.full_name,
        age: formData.age ? parseInt(formData.age) : null,
        address: formData.address || null,
        medical_notes: formData.medical_notes || null,
        inactivity_threshold_hours: parseInt(formData.inactivity_threshold_hours),
        last_activity_at: new Date().toISOString(),
        device_id: formData.device_id || null,
        device_phone_number: formData.device_phone_number || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${formData.full_name} has been added to monitoring`,
      });

      setFormData({
        full_name: "",
        age: "",
        address: "",
        medical_notes: "",
        inactivity_threshold_hours: "24",
        device_id: "",
        device_phone_number: "",
      });
      onOpenChange(false);
      onSuccess?.();
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Elderly Individual</DialogTitle>
          <DialogDescription>
            Add a new person to monitor for prolonged inactivity
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="75"
                min="1"
                max="150"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inactivity_threshold">Alert After (hours) *</Label>
              <Input
                id="inactivity_threshold"
                type="number"
                value={formData.inactivity_threshold_hours}
                onChange={(e) =>
                  setFormData({ ...formData, inactivity_threshold_hours: e.target.value })
                }
                placeholder="24"
                required
                min="1"
                max="168"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, City, State"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="medical_notes">Medical Notes</Label>
            <Textarea
              id="medical_notes"
              value={formData.medical_notes}
              onChange={(e) => setFormData({ ...formData, medical_notes: e.target.value })}
              placeholder="Any important medical information or conditions..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="device_id">CP141 Device ID</Label>
            <Input
              id="device_id"
              value={formData.device_id}
              onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
              placeholder="CP141-12345"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="device_phone_number">Device Phone Number</Label>
            <Input
              id="device_phone_number"
              type="tel"
              value={formData.device_phone_number}
              onChange={(e) => setFormData({ ...formData, device_phone_number: e.target.value })}
              placeholder="+1234567890"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Individual"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}