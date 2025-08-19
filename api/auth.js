// api/auth.js
export default async function handler(req, res) {
  const host = req.headers.host;
  const baseUrl = `https://${host}`;

  // URL'i güvenli parse et, trailing slash'ı sil
  const u = new URL(req.url, baseUrl);
  const pathname = u.pathname.replace(/\/+$/, ""); // "/api/auth/" -> "/api/auth"

  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;

  // /api/auth  (Decap buraya ?provider=github&site_id=... ekleyebilir; önemli değil)
  if (pathname === "/api/auth") {
    const redirect_uri = `${baseUrl}/api/auth/callback`;
    const gh = new URL("https://github.com/login/oauth/authorize");
    gh.searchParams.set("client_id", client_id);
    gh.searchParams.set("redirect_uri", redirect_uri);
    gh.searchParams.set("scope", "repo,user");
    res.setHeader("Cache-Control", "no-store");
    return res.redirect(302, gh.toString());
  }

  // /api/auth/callback?code=...
  if (pathname === "/api/auth/callback") {
    const code = u.searchParams.get("code");
    if (!code) return res.status(400).send("Missing code");

    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id, client_secret, code }),
    });
    const data = await r.json();

    if (!data.access_token) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      return res.status(400).send(
        `<pre>GitHub token alınamadı:\n${JSON.stringify(data, null, 2)}</pre>`
      );
    }

    const token = data.access_token;

    // Decap'ın beklediği postMessage formatı:
    // "authorization:github:success:{token:'...'}"
    const html = `<!doctype html><meta charset="utf-8"><script>
      try {
        var payload = 'authorization:github:success:' + JSON.stringify({ token: '${token}' });
        window.opener && window.opener.postMessage(payload, '*');
      } catch (e) { console.error(e); }
      window.close();
    </script>Giriş tamamlandı. Bu pencere kapanabilir.`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(html);
  }

  // diğerleri
  return res.status(404).send("Not found");
}
