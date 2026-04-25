/**
 * Custom Next.js server with Socket.io
 * Start with: npx tsx server.ts
 * Or: ts-node server.ts
 */
import { createServer } from "http";
import next from "next";
import { initSocketIO } from "./lib/socket-server";

const dev  = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT ?? 3000);

const app     = next({ dev });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  // Initialize Socket.io on the same HTTP server
  initSocketIO(httpServer);

  httpServer.listen(port, () => {
    console.log(`✅ InsightHub running at http://localhost:${port}`);
    console.log(`📡 Socket.io ready`);
  });
});
