import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

interface SendAlertRequest {
  elderly_profile_id: string;
  contact_id: string;
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { elderly_profile_id, contact_id, message }: SendAlertRequest = await req.json();

    // Get contact information
    const { data: contact, error: contactError } = await supabaseClient
      .from('contacts')
      .select('full_name, email, phone, alert_methods')
      .eq('id', contact_id)
      .single();

    if (contactError || !contact) {
      throw new Error('Contact not found');
    }

    // Get elderly profile information
    const { data: profile, error: profileError } = await supabaseClient
      .from('elderly_profiles')
      .select('full_name, address')
      .eq('id', elderly_profile_id)
      .single();

    if (profileError || !profile) {
      throw new Error('Elderly profile not found');
    }

    const alertMethods = contact.alert_methods || [];
    const results: any[] = [];

    // Send alerts via all selected methods
    for (const method of alertMethods) {
      let alertStatus = 'pending';
      let errorMessage = null;

      try {
        if (method === 'email' && contact.email) {
          // Send email via Resend
          const emailResponse = await resend.emails.send({
            from: "Prolonged Stay Alert <alerts@resend.dev>",
            to: [contact.email],
            subject: `⚠️ Inactivity Alert: ${profile.full_name}`,
            html: `
              <h1>Prolonged Stay Alert</h1>
              <p>Dear ${contact.full_name},</p>
              <p>${message}</p>
              <p><strong>Individual:</strong> ${profile.full_name}</p>
              <p><strong>Address:</strong> ${profile.address || 'Not provided'}</p>
              <p>Please check on them as soon as possible.</p>
              <p>Best regards,<br>Prolonged Stay Alert System</p>
            `,
          });

          console.log('Email sent:', emailResponse);
          alertStatus = 'sent';
        } else if (method === 'sms' && contact.phone) {
          // Send SMS via Twilio
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
          const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

          const response = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: contact.phone,
              From: twilioPhoneNumber!,
              Body: `⚠️ Prolonged Stay Alert: ${profile.full_name} - ${message}. Address: ${profile.address || 'Not provided'}. Please check on them.`,
            }),
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(`Twilio SMS error: ${error}`);
          }

          console.log('SMS sent to:', contact.phone);
          alertStatus = 'sent';
        } else if (method === 'voice_call' && contact.phone) {
          // Make voice call via Twilio
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`;
          const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

          const twimlUrl = `http://twimlets.com/message?Message=${encodeURIComponent(
            `This is a prolonged stay alert for ${profile.full_name}. ${message}. Address: ${profile.address || 'Not provided'}. Please check on them immediately.`
          )}`;

          const response = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: contact.phone,
              From: twilioPhoneNumber!,
              Url: twimlUrl,
            }),
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(`Twilio Voice error: ${error}`);
          }

          console.log('Voice call initiated to:', contact.phone);
          alertStatus = 'sent';
        } else {
          alertStatus = 'failed';
          errorMessage = `Invalid method or missing contact information for ${method}`;
        }
      } catch (alertError: any) {
        console.error(`Error sending ${method} alert:`, alertError);
        alertStatus = 'failed';
        errorMessage = alertError.message;
      }

      // Record each alert attempt in alert_history
      const { error: historyError } = await supabaseClient
        .from('alert_history')
        .insert({
          elderly_profile_id,
          contact_id,
          alert_method: method,
          message,
          status: alertStatus,
          sent_at: alertStatus === 'sent' ? new Date().toISOString() : null,
          error_message: errorMessage,
        });

      if (historyError) {
        console.error('Error recording alert history:', historyError);
      }

      results.push({ method, status: alertStatus, error: errorMessage });
    }

    const allSuccess = results.every(r => r.status === 'sent');
    const anySuccess = results.some(r => r.status === 'sent');

    return new Response(
      JSON.stringify({ 
        success: allSuccess,
        partial_success: !allSuccess && anySuccess,
        results,
        message: allSuccess 
          ? 'All alerts sent successfully' 
          : anySuccess 
            ? 'Some alerts sent successfully'
            : 'All alerts failed to send'
      }),
      { status: allSuccess ? 200 : anySuccess ? 207 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in send-alert function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
