import { createServer } from "node:net";
import { spawn } from "node:child_process";
import process from "node:process";

const host = "0.0.0.0";
const startPort = 3000;

function isFree(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });
    server.listen(port, host);
  });
}

async function findPort(port) {
  for (let current = port; current < port + 20; current += 1) {
    if (await isFree(current)) return current;
  }
  throw new Error(`No free port found from ${port} to ${port + 19}`);
}

function openBrowser(url) {
  const commands = {
    darwin: ["open", [url]],
    win32: ["cmd", ["/c", "start", "", url]],
    linux: ["xdg-open", [url]],
  };
  const command = commands[process.platform];
  if (!command) return;
  const child = spawn(command[0], command[1], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
}

const port = await findPort(startPort);
const url = `http://localhost:${port}`;

console.log(`Starting local server at ${url}`);
openBrowser(url);

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const child = spawn(npmCommand, ["run", "dev", "--", "-H", host, "-p", String(port)], {
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
