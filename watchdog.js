const http = require("http");
const { spawn } = require("child_process");

const PORT = process.env.PORT || 3000;
const CHECK_INTERVAL_MS = Number(process.env.CHECK_INTERVAL_MS || 15000);
const SUBDOMAIN = process.env.TUNNEL_SUBDOMAIN || "petitchat";
const HEALTH_URL = `http://localhost:${PORT}/`;

const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";
const npxCmd = isWin ? "npx.cmd" : "npx";

let serverProcess = null;
let tunnelProcess = null;
let restarting = false;

const spawnProcess = (command, args, label) => {
  const child = spawn(command, args, {
    stdio: "inherit",
    cwd: __dirname,
  });
  child.on("exit", (code) => {
    console.log(`[watchdog] ${label} quitte (code=${code}).`);
    if (!restarting) {
      setTimeout(() => startAll(), 1000);
    }
  });
  return child;
};

const startServer = () => {
  if (serverProcess) return;
  console.log("[watchdog] demarrage du serveur...");
  serverProcess = spawnProcess(npmCmd, ["start"], "serveur");
};

const startTunnel = () => {
  if (tunnelProcess) return;
  console.log("[watchdog] demarrage du tunnel...");
  tunnelProcess = spawnProcess(
    npxCmd,
    ["localtunnel", "--port", String(PORT), "--subdomain", SUBDOMAIN],
    "tunnel"
  );
};

const stopAll = () => {
  restarting = true;
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  if (tunnelProcess) {
    tunnelProcess.kill();
    tunnelProcess = null;
  }
  setTimeout(() => {
    restarting = false;
  }, 500);
};

const startAll = () => {
  startServer();
  startTunnel();
};

const checkHealth = () =>
  new Promise((resolve) => {
    const req = http.get(HEALTH_URL, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(4000, () => {
      req.destroy();
      resolve(false);
    });
  });

const loop = async () => {
  const ok = await checkHealth();
  if (!ok) {
    console.log("[watchdog] site down, redemarrage...");
    stopAll();
    setTimeout(() => startAll(), 1000);
  }
};

process.on("SIGINT", () => {
  stopAll();
  process.exit(0);
});

startAll();
setInterval(loop, CHECK_INTERVAL_MS);
