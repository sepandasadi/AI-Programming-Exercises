import { Hono } from "hono";
import { health } from "@relay/core";

export function createApp(): Hono {
  const app = new Hono();
  app.get("/health", (c) => c.json(health()));
  return app;
}
