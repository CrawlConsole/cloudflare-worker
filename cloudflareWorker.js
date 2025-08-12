export default {
  async fetch(request, env, ctx) {
    let response;
    try {
      const url = new URL(request.url);
      const headers = Object.fromEntries(request.headers.entries());
      const clientIP = headers['cf-connecting-ip'];

      // Fetch the actual response to get the status code
      response = await fetch(request);
      const statusCode = response.status;

      const payload = {
        project_key: env.CRAWLCONSOLE_PROJECT_KEY,
        user_agent: headers['user-agent'] || null,
        path: url.pathname,
        client_ip: clientIP,
        full_path: url.pathname + url.search,
        referrer: headers['referer'] || null,
        referrer_domain: headers['referer']
          ? new URL(headers['referer']).hostname
          : null,
        status_code: statusCode,
      };

      ctx.waitUntil(
        fetch('https://api.crawlconsole.com/v1/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': env.CRAWLCONSOLE_API_KEY,
          },
          body: JSON.stringify(payload),
        })
      );
    } catch (err) {
      console.error(err);
      // Optionally, send a failed status_code to tracking as well
    }

    return response || new Response('Internal Error', { status: 500 });
  },
};