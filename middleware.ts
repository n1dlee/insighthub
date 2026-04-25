// Next.js requires middleware to be in middleware.ts at the project root.
// The actual logic lives in proxy.ts (Edge-safe, no Node.js imports).
export { proxy as middleware, config } from "./proxy";
