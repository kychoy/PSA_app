import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse incoming SMS data (Twilio format)
    const formData = await req.formData();
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const messageId = formData.get('MessageSid') as string;

    console.log('Received SMS from:', from, 'Body:', body);

    // Find elderly profile by device phone number
    const { data: profile, error: profileError } = await supabaseClient
      .from('elderly_profiles')
      .select('id')
      .eq('device_phone_number', from)
      .single();

    if (profileError || !profile) {
      console.error('Profile not found for phone:', from);
      return new Response('Profile not found', { status: 404, headers: corsHeaders });
    }

    // Record device activity
    const { error: activityError } = await supabaseClient
      .from('device_activity')
      .insert({
        elderly_profile_id: profile.id,
        device_id: messageId,
        sms_from: from,
        sms_body: body,
        received_at: new Date().toISOString(),
      });

    if (activityError) {
      console.error('Error recording activity:', activityError);
      throw activityError;
    }

    // Update last_activity_at on elderly profile
    const { error: updateError } = await supabaseClient
      .from('elderly_profiles')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw updateError;
    }

    console.log('Activity recorded successfully for profile:', profile.id);

    return new Response(
      JSON.stringify({ success: true, message: 'Activity recorded' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in receive-sms function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
