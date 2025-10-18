import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, UserPlus, Edit2, Trash2, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AddContactDialog } from "./AddContactDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Contact {
  id: string;
  contact_name: string;
  relationship: string | null;
  email: string | null;
  phone_number: string | null;
  notification_method: string[]; // array for multi-select
}

interface ContactListProps {
  userId: string;
}

export default function ContactList({ userId }: ContactListProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();

    const channel = supabase
      .channel(`user_contacts_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_contacts",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchContacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("user_contacts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setShowAddDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("user_contacts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setDeletingContactId(null);
  };

  const handleDialogClose = () => {
    setShowAddDialog(false);
    setEditingContact(null);
    fetchContacts();
  };

  const getAlertMethodIcon = (method: string) => {
    switch (method) {
      case "email":
        return <Mail className="h-3 w-3" />;
      case "sms":
        return <Phone className="h-3 w-3" />;
      case "voice_call":
        return <Phone className="h-3 w-3" />;
      default:
        return <Mail className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-muted-foreground">Loading contacts...</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Emergency Contacts</h3>
        </div>
        <Button onClick={() => setShowAddDialog(true)} size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">No contacts added yet</h4>
            <p className="text-muted-foreground mb-4">
              Add emergency contacts to receive alerts
            </p>
            <Button onClick={() => setShowAddDialog(true)} variant="outline">
              <UserPlus className="h-4 w-4 mr-2" />
              Add First Contact
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3">
          {contacts.map((contact) => (
            <Card key={contact.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{contact.contact_name}</h4>
                    {contact.relationship && (
                      <Badge variant="secondary">{contact.relationship}</Badge>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    {contact.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </div>
                    )}
                    {contact.phone_number && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {contact.phone_number}
                      </div>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">Alert methods:</span>
                      {contact.notification_method?.map((method) => (
                        <Badge key={method} variant="outline" className="gap-1">
                          {getAlertMethodIcon(method)}
                          <span className="capitalize">{method.replace("_", " ")}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(contact)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingContactId(contact.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddContactDialog
        open={showAddDialog}
        onOpenChange={handleDialogClose}
        userId={userId}
        contact={editingContact}
      />

      <AlertDialog
        open={!!deletingContactId}
        onOpenChange={() => setDeletingContactId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingContactId && handleDelete(deletingContactId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
