import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface Contact {
  id: string;
  contact_name: string;
  relationship: string | null;
  email: string | null;
  phone_number: string | null;
  notification_method: string[];
}

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  contact?: Contact | null;
}

export function AddContactDialog({
  open,
  onOpenChange,
  userId,
  contact,
}: AddContactDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contact_name: "",
    relationship: "",
    email: "",
    phone_number: "",
    notification_method: ["email"],
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        contact_name: contact.contact_name,
        relationship: contact.relationship || "",
        email: contact.email || "",
        phone_number: contact.phone_number || "",
        notification_method: contact.notification_method || ["email"],
      });
    } else {
      setFormData({
        contact_name: "",
        relationship: "",
        email: "",
        phone_number: "",
        notification_method: ["email"],
      });
    }
  }, [contact, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.contact_name.trim()) throw new Error("Name is required");
      if (!formData.email && !formData.phone_number) throw new Error("Please provide at least email or phone number");
      if (formData.notification_method.length === 0) throw new Error("Please select at least one alert method");

      const contactData = {
        contact_name: formData.contact_name.trim(),
        relationship: formData.relationship.trim() || null,
        email: formData.email.trim() || null,
        phone_number: formData.phone_number.trim() || null,
        notification_method: formData.notification_method,
        user_id: userId,
      };

      if (contact) {
        const { error } = await supabase
          .from("user_contacts")
          .update(contactData)
          .eq("id", contact.id);
        if (error) throw error;
        toast({ title: "Success", description: "Contact updated successfully" });
      } else {
        const { error } = await supabase.from("user_contacts").insert([contactData]);
        if (error) throw error;
        toast({ title: "Success", description: "Contact added successfully" });
      }
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full w-[98vw] sm:max-w-[450px] p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {contact ? "Edit Contact" : "Add Emergency Contact"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Add family members, friends, or caregivers who should receive alerts
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4 w-full">
          <div className="space-y-2">
            <Label htmlFor="contact_name">Contact Name *</Label>
            <Input
              id="contact_name"
              value={formData.contact_name}
              onChange={(e) =>
                setFormData({ ...formData, contact_name: e.target.value })
              }
              placeholder="Enter contact name"
              required
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Input
              id="relationship"
              value={formData.relationship}
              onChange={(e) =>
                setFormData({ ...formData, relationship: e.target.value })
              }
              placeholder="e.g., Daughter, Son, Friend, Neighbor"
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="contact@example.com"
              className="text-sm"
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
              className="text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Alert Methods *</Label>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Select all methods to receive alerts
            </p>
            <div className="space-y-2">
              {["email", "sms", "voice"].map((method) => (
                <div key={method} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${method}-method`}
                    checked={formData.notification_method.includes(method)}
                    onCheckedChange={(checked) => {
                      const methods = checked
                        ? [...formData.notification_method, method]
                        : formData.notification_method.filter((m) => m !== method);
                      setFormData({ ...formData, notification_method: methods });
                    }}
                  />
                  <label htmlFor={`${method}-method`} className="text-xs sm:text-sm font-medium capitalize">
                    {method === "voice" ? "Voice Call" : method.toUpperCase()}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end w-full pt-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Saving..." : contact ? "Update" : "Add Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
