const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3000;
const BASE_DIR = path.resolve(__dirname);
const LOG_FILE = path.join(BASE_DIR, "access.log");
const UNLOCK_TOKEN = process.env.UNLOCK_TOKEN || "petitchat";
const LOGS_TOKEN = process.env.LOGS_TOKEN || "petitchatlogs";
const COOKIE_NAME = "sv_unlock";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

const deniedFiles = new Set([
  "access.log",
  "server.js",
  "watchdog.js",
  "package.json",
  "package-lock.json",
]);

const safeResolve = (urlPath) => {
  const normalized = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(BASE_DIR, normalized);
  if (!filePath.startsWith(BASE_DIR)) return null;
  return filePath;
};

const logRequest = (req, unlockAttempt, unlockOk) => {
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown";
  const ua = req.headers["user-agent"] || "unknown";
  const line = `${new Date().toISOString()} ip=${ip} method=${
    req.method
  } url=${req.url} unlockAttempt=${unlockAttempt ? "1" : "0"} unlockOk=${
    unlockOk ? "1" : "0"
  } ua="${ua.replace(/"/g, "'")}"\n`;
  fs.appendFile(LOG_FILE, line, () => {});
};

const parseCookies = (cookieHeader) => {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce((acc, part) => {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rawValue.join("="));
    return acc;
  }, {});
};

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("405 - Methode non autorisee");
    return;
  }

  const requestUrl = new URL(req.url, "http://localhost");
  const cookies = parseCookies(req.headers.cookie || "");
  if (requestUrl.pathname === "/logs") {
    const token = requestUrl.searchParams.get("token");
    if (token !== LOGS_TOKEN) {
      res.writeHead(401, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("401 - Non autorise");
      return;
    }
    fs.readFile(LOG_FILE, "utf8", (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("404 - Logs introuvables");
        return;
      }
      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(data);
    });
    return;
  }
  if (requestUrl.pathname === "/unlock") {
    const token = requestUrl.searchParams.get("token");
    const ok = token === UNLOCK_TOKEN;
    logRequest(req, true, ok);
    if (!ok) {
      res.writeHead(401, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("401 - Non autorise");
      return;
    }
    res.writeHead(302, {
      Location: "/",
      "Set-Cookie": `${COOKIE_NAME}=1; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`,
    });
    res.end();
    return;
  }

  const unlockParam = requestUrl.searchParams.get("unlock");
  const unlockAttempt = typeof unlockParam === "string";
  const unlockOk = unlockParam === UNLOCK_TOKEN;
  const cookieUnlock = cookies[COOKIE_NAME] === "1";

  const urlPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const filePath = safeResolve(urlPath);
  const baseName = filePath ? path.basename(filePath) : "";
  const ext = filePath ? path.extname(filePath).toLowerCase() : "";

  logRequest(req, unlockAttempt, unlockOk);

  if (!filePath || deniedFiles.has(baseName) || !mimeTypes[ext]) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 - Fichier introuvable");
    return;
  }

  const nonce = crypto.randomBytes(12).toString("base64");
  const headers = {
    "Content-Type": mimeTypes[ext],
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self'; img-src 'self' data:;`,
  };
  if (unlockOk) {
    headers["Set-Cookie"] = `${COOKIE_NAME}=1; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
  }

  if (baseName === "index.html") {
    headers["Cache-Control"] = "no-store";
    fs.readFile(filePath, "utf8", (err, html) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("404 - Fichier introuvable");
        return;
      }
      const unlockScript = `<script nonce="${nonce}">window.__UNLOCK__ = ${
        unlockOk || cookieUnlock ? "true" : "false"
      };</script>`;
      const appScriptTag = '<script src="./app.js"></script>';
      let body = html;
      if (body.includes(appScriptTag)) {
        body = body.replace(appScriptTag, `${unlockScript}\n${appScriptTag}`);
      } else {
        const marker = "</body>";
        body = body.includes(marker)
          ? body.replace(marker, `${unlockScript}\n${marker}`)
          : `${body}\n${unlockScript}`;
      }
      res.writeHead(200, headers);
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      res.end(body);
    });
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 - Fichier introuvable");
      return;
    }
    res.writeHead(200, headers);
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Serveur lance sur http://localhost:${PORT}`);
});
