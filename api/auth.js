export default async function handler(req, res) {
  // Decap GitHub OAuth proxy (sade forward)
  if (req.method === "GET" && req.url === "/api/auth/status") {
    return res.status(200).json({ ok: true });
  }

  // Decap’ın beklediği endpoint yapısı:
  // /api/auth, /api/auth/callback, /api/auth/refresh
  const upstream = "https://oauth.netlify.com"; // Decap default
  const url = new URL(req.url, `https://${req.headers.host}`);
  url.host = new URL(upstream).host;

  const r = await fetch(url.toString(), {
    method: req.method,
    headers: { ...req.headers, host: url.host },
    body: ["GET", "HEAD"].includes(req.method) ? undefined : req.body,
  });

  const buf = Buffer.from(await r.arrayBuffer());
  res.status(r.status);
  r.headers.forEach((v, k) => res.setHeader(k, v));
  return res.send(buf);
}
