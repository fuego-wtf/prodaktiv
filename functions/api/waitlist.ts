interface Env {
  LOOPS_API_KEY?: string;
  LOOPS_SOURCE?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

export const onRequestOptions = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    const body = (await request.json()) as { email?: string; source?: string };
    const email = (body.email || '').trim();
    const source = body.source || env.LOOPS_SOURCE || 'prodaktiv-waitlist';

    if (!email || !email.includes('@')) {
      return json({ success: false, error: 'Invalid email' }, 400);
    }

    const loopsApiKey = env.LOOPS_API_KEY;
    if (!loopsApiKey) {
      console.error('LOOPS_API_KEY not configured');
      return json({ success: false, error: 'Server configuration error' }, 500);
    }

    const loopsResponse = await fetch('https://app.loops.so/api/v1/contacts/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${loopsApiKey}`,
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
      if (loopsData.message?.includes('already exists')) {
        return json({ success: true, message: 'Already on waitlist' }, 200);
      }

      console.error('Loops API error:', loopsData);
      return json({ success: false, error: 'Failed to join waitlist' }, 500);
    }

    return json({ success: true, message: 'Added to waitlist' }, 200);
  } catch (error) {
    console.error('Waitlist error:', error);
    return json({ success: false, error: 'Server error' }, 500);
  }
};
