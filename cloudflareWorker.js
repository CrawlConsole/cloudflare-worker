export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const headers = Object.fromEntries(request.headers.entries());
      const clientIP = headers['cf-connecting-ip'];

      const payload = {
        api_key: env.CRAWLCONSOLE_API_KEY,
        project_key: env.CRAWLCONSOLE_PROJECT_KEY,
        user_agent: headers['user-agent'] || null,
        path: url.pathname,
        client_ip: clientIP,
        full_path: url.pathname + url.search,
        referrer: headers['referer'] || null,
        referrer_domain: headers['referer']
          ? new URL(headers['referer']).hostname
          : null,
        headers: headers,
      };

      ctx.waitUntil(
        fetch('https://api.crawlconsole.com/v1/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      );

      ctx.waitUntil(
        fetch('https://api.crawlconsole.com/v1/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      );
    } catch (err) {
      console.error(err);
    }

    return fetch(request);
  },
};
