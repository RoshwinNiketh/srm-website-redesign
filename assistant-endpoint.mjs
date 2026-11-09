import { handle } from "./assistant-server.mjs";
import { apiError, apiHeaders, validateBody, validateRequest } from "./api-request.mjs";

export function assistantEndpoint(kind) {
  return async (request, response) => {
    for (const [name, value] of Object.entries(apiHeaders)) response.setHeader(name, value);
    let result = validateRequest(request.method, request.headers);
    if (result?.status === 405) response.setHeader("Allow", "POST");
    if (!result && process.env.SRM_ENABLE_PUBLIC_AI !== "true") {
      result = apiError(503, "AI answers are disabled. Page navigation still works.");
    }
    if (!result) {
      const parsed = validateBody(kind, request.body);
      result = parsed.status ? parsed : await handle(kind, parsed.body, {
        ip: "public",
        origin: request.headers.origin,
        host: request.headers.host,
      });
    }
    response.status(result.status).json(result.json);
  };
}
