import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Phone, PhoneCall, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AlertHistoryItem {
  id: string;
  alert_method: string;
  status: string;
  sent_at: string | null;
  created_at: string;
  message: string;
  error_message: string | null;
  contacts: {
    full_name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

interface AlertHistoryProps {
  elderlyProfileId: string;
}

const AlertHistory = ({ elderlyProfileId }: AlertHistoryProps) => {
  const [alerts, setAlerts] = useState<AlertHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAlertHistory();
  }, [elderlyProfileId]);

  const loadAlertHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("alert_history")
      .select(`
        id,
        alert_method,
        status,
        sent_at,
        created_at,
        message,
        error_message,
        contacts (
          full_name,
          email,
          phone
        )
      `)
      .eq("elderly_profile_id", elderlyProfileId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error loading alert history",
        description: error.message,
      });
    } else {
      setAlerts(data || []);
    }
    setLoading(false);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "email":
        return <Mail className="w-4 h-4" />;
      case "sms":
        return <Phone className="w-4 h-4" />;
      case "voice_call":
        return <PhoneCall className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Sent
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getContactInfo = (alert: AlertHistoryItem) => {
    if (!alert.contacts) return "Unknown contact";
    
    const contactDetails = [];
    if (alert.alert_method === "email" && alert.contacts.email) {
      contactDetails.push(alert.contacts.email);
    } else if ((alert.alert_method === "sms" || alert.alert_method === "voice_call") && alert.contacts.phone) {
      contactDetails.push(alert.contacts.phone);
    }
    
    return contactDetails.length > 0 
      ? `${alert.contacts.full_name} (${contactDetails.join(", ")})`
      : alert.contacts.full_name;
  };

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">Loading alert history...</p>;
  }

  if (alerts.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No alerts have been sent yet.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.map((alert) => (
            <TableRow key={alert.id}>
              <TableCell className="whitespace-nowrap">
                {alert.sent_at 
                  ? new Date(alert.sent_at).toLocaleString()
                  : new Date(alert.created_at).toLocaleString()}
              </TableCell>
              <TableCell>{getContactInfo(alert)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getMethodIcon(alert.alert_method)}
                  <span className="capitalize">{alert.alert_method.replace("_", " ")}</span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(alert.status)}</TableCell>
              <TableCell className="max-w-xs truncate">
                {alert.error_message ? (
                  <span className="text-destructive text-sm">{alert.error_message}</span>
                ) : (
                  <span className="text-sm">{alert.message}</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AlertHistory;
