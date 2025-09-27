import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeviceValidationRequest {
  fingerprint: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { fingerprint, userId, ipAddress, userAgent }: DeviceValidationRequest = await req.json();

    if (!fingerprint) {
      return new Response(
        JSON.stringify({ error: 'Device fingerprint is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if device is banned
    const { data: isBanned, error: banCheckError } = await supabase
      .rpc('check_device_ban_status', { fingerprint });

    if (banCheckError) {
      console.error('Error checking ban status:', banCheckError);
      return new Response(
        JSON.stringify({ error: 'Failed to check device status' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // If device is banned, return banned status
    if (isBanned) {
      console.log(`Blocked access for banned device: ${fingerprint}`);
      return new Response(
        JSON.stringify({ 
          allowed: false, 
          reason: 'Device is banned from accessing this application',
          banned: true
        }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // If userId is provided, log the device session
    if (userId) {
      const { error: logError } = await supabase
        .rpc('log_device_session', {
          fingerprint,
          user_id_param: userId,
          ip_addr: ipAddress,
          user_agent_param: userAgent
        });

      if (logError) {
        console.error('Error logging device session:', logError);
        // Don't block access if logging fails, just log the error
      }
    }

    // Device is allowed
    return new Response(
      JSON.stringify({ 
        allowed: true, 
        banned: false
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Device validation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});