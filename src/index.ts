import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "hono/adapter";
import { podcastIndex } from "./services/podcastIndex";

const app = new Hono();

app.use(async (c, next) => {
  const { FRONTEND_URL } = env(c, "workerd");

  // Apply CORS dynamically based on environment variables
  return cors({
    origin: (FRONTEND_URL as string) ?? "http://localhost:5173",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })(c, next);
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/episodes", async (c) => {
  const client = podcastIndex(c);
  const episodes = await client.getRecentEpisodes({
    max: "7",
    pretty: "true",
  });
  return c.json(episodes);
});

app.get("/feeds/:id", async (c) => {
  const id = c.req.param("id");
  const client = podcastIndex(c);
  const feed = await client.getFeed({
    id: id,
    pretty: "true",
  });
  return c.json(feed);
});

export default app;
