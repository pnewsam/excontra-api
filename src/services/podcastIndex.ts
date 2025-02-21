import { sha1 } from "hono/utils/crypto";
import { Context } from "hono";
import { env, getRuntimeKey } from "hono/adapter";
import { Episode } from "../schemas/episodes";

export function podcastIndex(c: Context) {
  const API_URL = "https://api.podcastindex.org/api/1.0";
  const runtime = getRuntimeKey();

  const { PODCAST_INDEX_API_KEY, PODCAST_INDEX_API_SECRET } = env(c, runtime);

  async function getAuthorization(timestamp: number) {
    const input = `${PODCAST_INDEX_API_KEY}${PODCAST_INDEX_API_SECRET}${timestamp.toString()}`;
    const hash = await sha1(input);
    return hash;
  }

  async function getHeaders() {
    const timestamp = Math.floor(Date.now() / 1000);
    const authorization = (await getAuthorization(timestamp)) ?? "";
    return {
      "User-Agent": "ExContra/1.0",
      "X-Auth-Key": PODCAST_INDEX_API_KEY,
      "X-Auth-Date": timestamp.toString(),
      Authorization: authorization,
    };
  }

  function get<T>(path: string): () => Promise<T> {
    return async () => {
      const headers = await getHeaders();
      try {
        const response = await fetch(`${API_URL}/${path}`, {
          headers: {
            ...headers,
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*",
          },
        });
        return response.json();
      } catch (error) {
        throw error;
      }
    };
  }

  const getRecentEpisodes = get<Episode[]>("recent/episodes?max=7&pretty");

  return {
    getRecentEpisodes,
  };
}
