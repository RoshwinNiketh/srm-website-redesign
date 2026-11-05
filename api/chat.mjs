import { handle } from "../assistant-server.mjs";

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ ok: false });
  const { status, json } = await handle("chat", request.body, {
    ip: String(request.headers["x-forwarded-for"] || "").split(",")[0],
    origin: request.headers.origin,
    host: request.headers.host,
  });
  response.status(status).json(json);
}
