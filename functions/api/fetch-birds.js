/**
 * This is the Cloudflare Worker version of your fetch-birds.js function.
 * It will automatically run when /api/fetch-birds is called.
 */
export async function onRequestGet(context) {
  try {
    // Get the API key from Cloudflare's environment variables
    const EBIRD_API_KEY = context.env.EBIRD_API_KEY;

    if (!EBIRD_API_KEY) {
      throw new Error('API key not configured in Cloudflare');
    }

    // Get query parameters from the URL
    const { searchParams } = new URL(context.request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const dist = searchParams.get('dist') || '30';
    const back = searchParams.get('back') || '30';

    if (!lat || !lng) {
      return new Response(JSON.stringify({ error: 'Missing required parameters: lat, lng' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Make the request to eBird API
    const ebirdUrl = `https://api.ebird.org/v2/data/obs/geo/recent?lat=${lat}&lng=${lng}&dist=${dist}&back=${back}&sort=date`;

    const response = await fetch(ebirdUrl, {
      headers: { 'X-eBirdApiToken': EBIRD_API_KEY },
    });

    if (!response.ok) {
      throw new Error(`eBird API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Return the data as a new response
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Add CORS header
      },
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch bird data', message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
