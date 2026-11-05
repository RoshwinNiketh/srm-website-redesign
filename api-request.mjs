export const MAX_BODY_BYTES = 8192;
export const apiHeaders = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };
export const apiError = (status, error) => ({ status, json: { ok: false, error } });

export function validateRequest(method, headers) {
  if (method !== "POST") return apiError(405, "Use POST.");
  if (headers["content-type"]?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return apiError(415, "Send an application/json request.");
  }
  if (Number(headers["content-length"]) > MAX_BODY_BYTES) return apiError(413, "Request is too large.");
  return null;
}

const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const allowedKeys = (value, keys) => Object.keys(value).every((key) => keys.includes(key));

export function validateBody(kind, body) {
  if (typeof body === "string") {
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) return apiError(413, "Request is too large.");
    try { body = JSON.parse(body); } catch { return apiError(400, "Invalid JSON."); }
  }
  if (body !== undefined && Buffer.byteLength(JSON.stringify(body)) > MAX_BODY_BYTES) {
    return apiError(413, "Request is too large.");
  }
  if (!record(body) || (body.page != null &&
      (typeof body.page !== "string" || !/^\/(?!\/)[a-z0-9/-]{0,100}$/i.test(body.page)))) {
    return apiError(400, "Invalid request.");
  }
  if (kind === "page" && allowedKeys(body, ["page", "mode"]) && ["summary", "simplify"].includes(body.mode)) {
    return { body };
  }
  if (kind === "chat" && allowedKeys(body, ["message", "history", "page"]) &&
      typeof body.message === "string" && body.message.trim() && body.message.length <= 500 &&
      (body.history === undefined || (Array.isArray(body.history) && body.history.length <= 6 &&
        body.history.every((turn) => record(turn) && allowedKeys(turn, ["role", "text"]) &&
          ["user", "assistant"].includes(turn.role) && typeof turn.text === "string" && turn.text.length <= 600)))) {
    return { body };
  }
  return apiError(400, "Invalid request.");
}
