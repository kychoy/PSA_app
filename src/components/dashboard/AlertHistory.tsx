import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Phone, PhoneCall, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AlertHistoryProps {
  userId: string;
}

interface AlertHistoryItem {
  id: string;
  alert_type: string;
  notification_method: string;
  status: string;
  sent_at: string | null;
  created_at: string;
  response_log: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  cp141_phone_number: string | null;
}

const AlertHistory = ({ userId }: AlertHistoryProps) => {
  const [alerts, setAlerts] = useState<AlertHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAlertHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadAlertHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("alert_history")
      .select(
        "id, alert_type, notification_method, status, sent_at, created_at, response_log, contact_email, contact_phone, cp141_phone_number"
      )
      .eq("user_id", userId)
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
    switch (method?.toLowerCase()) {
      case "email":
        return <Mail className="w-4 h-4" />;
      case "sms":
        return <Phone className="w-4 h-4" />;
      case "voice_call":
      case "voice":
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
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Device</TableHead>
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
              <TableCell>{alert.contact_email}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getMethodIcon(alert.notification_method)}
                  <span className="capitalize">
                    {alert.notification_method.replace("_", " ")}
                  </span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(alert.status)}</TableCell>
              <TableCell>{alert.cp141_phone_number ?? "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AlertHistory;

