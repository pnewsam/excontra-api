import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "hono/adapter";
import { podcastIndex } from "./services/podcastIndex";

const app = new Hono();

app.use("*", (c, next) => {
  const { FRONTEND_URL } = env(c, "workerd");
  return cors({
    origin: (FRONTEND_URL as string) ?? "http://localhost:5173",
  })(c, next);
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/episodes", async (c) => {
  const client = podcastIndex(c);
  const episodes = await client.getRecentEpisodes();
  console.log({ episodes });
  return c.json(episodes);
});

export default app;
