import { clientIp, handle } from "../assistant-server.mjs";

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ ok: false });
  let body;
  try {
    body = request.body;
  } catch {
    return response.status(400).json({ ok: false, error: "Invalid request." });
  }
  const { status, json } = await handle("page", body, {
    ip: clientIp(request.headers),
    origin: request.headers.origin,
    host: request.headers.host,
    contentType: request.headers["content-type"],
  });
  response.status(status).json(json);
}
