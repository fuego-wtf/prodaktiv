// Vercel Serverless Function - POST /api/waitlist
// Proxies waitlist signups to Loops API (keeps API key server-side)

export const config = {
  runtime: 'edge',
};

interface WaitlistRequest {
  email: string;
  source?: string;
}

export default async function handler(request: Request) {
  // Only allow POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body: WaitlistRequest = await request.json();
    const { email, source = 'prodaktiv-waitlist' } = body;

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Loops API
    const loopsApiKey = process.env.LOOPS_API_KEY;

    if (!loopsApiKey) {
      console.error('LOOPS_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const loopsResponse = await fetch('https://app.loops.so/api/v1/contacts/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loopsApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        source,
        userGroup: 'waitlist',
        subscribed: true,
      }),
    });

    const loopsData = await loopsResponse.json();

    if (!loopsResponse.ok) {
      // Handle "contact already exists" as success
      if (loopsData.message?.includes('already exists')) {
        return new Response(
          JSON.stringify({ success: true, message: 'Already on waitlist' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.error('Loops API error:', loopsData);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to join waitlist' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Added to waitlist' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Waitlist error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
