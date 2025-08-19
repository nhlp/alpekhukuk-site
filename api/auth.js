// api/auth.js
export default async function handler(req, res) {
  const host = req.headers.host;
  const baseUrl = `https://${host}`;
  const u = new URL(req.url, baseUrl);
  const pathname = u.pathname.replace(/\/+$/, ""); // "/api/auth/" -> "/api/auth"
  const provider = u.searchParams.get("provider") || "github";
  const code = u.searchParams.get("code");

  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;

  // 1) Login başlat (GitHub authorize'a yönlendir)
  if (pathname === "/api/auth") {
    const redirect_uri = `${baseUrl}/api/auth/callback`;
    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", client_id);
    url.searchParams.set("redirect_uri", redirect_uri);
    url.searchParams.set("scope", "repo");
    url.searchParams.set("allow_signup", "true");
    return res.redirect(302, url.toString());
  }

  // 2) Callback: code -> access_token
  if (pathname === "/api/auth/callback") {
    if (!code) {
      return res.status(400).send("Missing code");
    }
    try {
      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ client_id, client_secret, code })
      });
      const tokenJson = await tokenRes.json();
      if (!tokenJson.access_token) {
        return res.status(400).send(`token error: ${JSON.stringify(tokenJson)}`);
      }
      const token = tokenJson.access_token;

      // Kritik kısım: Decap’in dinlediği formatta postMessage
      const html = `<!doctype html><html><body>
        <script>
          try {
            var payload = 'authorization:${provider}:success:' + JSON.stringify({ token: '${token}' });
            window.opener && window.opener.postMessage(payload, '*');
          } catch (e) { console.error(e); }
          window.close();
        </script>
        Başarılı, pencere kapanabilir.
      </body></html>`;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(html);
    } catch (e) {
      return res.status(500).send("OAuth error: " + e.message);
    }
  }

  // 404
  return res.status(404).send("Not found");
}
