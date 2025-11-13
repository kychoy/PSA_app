import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Smartphone, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddDeviceDialog } from "./AddDeviceDialog";
import { Badge } from "@/components/ui/badge";

interface PhoneEntry {
  id: string;
  phone_number: string;
  location: string;
  no_contact_period: string; // interval string, e.g. "24:00:00"
  active: boolean;
  created_at: string;
}

const intervalToHours = (interval: string) => {
  // Simple handling: expects format 'N:00:00'
  if (!interval) return "N/A";
  const parts = interval.split(":");
  return parseInt(parts[0], 10);
};

export const DeviceList = () => {
  const [entries, setEntries] = useState<PhoneEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PhoneEntry | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPhones();
  }, []);

  const loadPhones = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("phone_numbers_cp141")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load phone entries",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("phone_numbers_cp141")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Entry deleted successfully",
      });
      loadPhones();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete entry",
      });
    }
  };

  const handleEdit = (entry: PhoneEntry) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingEntry(null);
    loadPhones();
  };

  if (loading) {
    return <div>Loading entries...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Devices</h2>
          <p className="text-muted-foreground">Manage monitored phone numbers</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Phone
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Smartphone className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No phone entries yet. Add your first phone location to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{entry.location}</CardTitle>
                  </div>
                  <Badge variant={entry.active ? "default" : "secondary"}>
                    {entry.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription>{entry.phone_number}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Inactivity threshold: {intervalToHours(entry.no_contact_period)} hours
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
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
        editPhoneNumber={editingEntry}
      />
    </div>
  );
};
