# Optional: Private R2 Bucket Through Cloudflare Worker

The easiest setup is to expose product JSON through an R2 public/custom domain and set `R2_PUBLIC_BASE_URL`.

If you prefer a private bucket, place a Cloudflare Worker in front of R2 and expose only safe JSON paths such as `/products/*.json` and `/products/index.json`. Then set:

```bash
R2_PUBLIC_BASE_URL=https://your-worker.your-subdomain.workers.dev
```

Minimal Worker idea:

```js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.pathname.replace(/^\/+/, '');
    if (!/^products\/[a-z0-9._-]+\.json$/.test(key) && key !== 'products/index.json') {
      return new Response('Not found', { status: 404 });
    }
    const object = await env.BPF_PRODUCTS_BUCKET.get(key);
    if (!object) return new Response('Not found', { status: 404 });
    return new Response(object.body, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  }
}
```

This keeps the bucket private while Next.js can still fetch product JSON through HTTPS.
