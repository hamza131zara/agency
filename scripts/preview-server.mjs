import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = fileURLToPath(new URL("../", import.meta.url));
const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".csv", "text/csv; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

function isInsideRoot(root, target) {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function sendText(response, statusCode, message, extraHeaders = {}) {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    ...extraHeaders,
  });
  response.end(message);
}

export function createPreviewServer({ root = PROJECT_ROOT } = {}) {
  const resolvedRoot = path.resolve(root);

  return createServer(async (request, response) => {
    const method = request.method ?? "GET";
    if (method !== "GET" && method !== "HEAD") {
      sendText(response, 405, "Method not allowed. Use GET or HEAD.", { Allow: "GET, HEAD" });
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    } catch {
      sendText(response, 400, "Invalid URL path.");
      return;
    }

    if (pathname.includes("\\") || pathname.includes("\0")) {
      sendText(response, 400, "Invalid URL path.");
      return;
    }

    const segments = pathname.split("/").filter(Boolean);
    if (segments.some((segment) => segment === "." || segment === ".." || segment.startsWith("."))) {
      sendText(response, 404, "Not found.");
      return;
    }

    if (segments.length > 0 && path.extname(segments.at(-1)).toLowerCase() === ".php") {
      sendText(
        response,
        501,
        "PHP is not executed by the Node preview server. Install/configure PHP to test server-side form handling."
      );
      return;
    }

    const requestedPath = path.resolve(resolvedRoot, ...segments);
    if (!isInsideRoot(resolvedRoot, requestedPath)) {
      sendText(response, 404, "Not found.");
      return;
    }

    try {
      const rootRealPath = await realpath(resolvedRoot);
      let filePath = await realpath(requestedPath);
      if (!isInsideRoot(rootRealPath, filePath)) {
        sendText(response, 404, "Not found.");
        return;
      }

      let fileInfo = await stat(filePath);
      if (fileInfo.isDirectory()) {
        filePath = await realpath(path.join(filePath, "index.html"));
        if (!isInsideRoot(rootRealPath, filePath)) {
          sendText(response, 404, "Not found.");
          return;
        }
        fileInfo = await stat(filePath);
      }

      if (!fileInfo.isFile()) {
        sendText(response, 404, "Not found.");
        return;
      }

      const contentType = MIME_TYPES.get(path.extname(filePath).toLowerCase());
      if (!contentType) {
        sendText(response, 415, "Unsupported file type.");
        return;
      }

      response.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Length": fileInfo.size,
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      });

      if (method === "HEAD") {
        response.end();
        return;
      }

      const stream = createReadStream(filePath);
      stream.on("error", () => {
        if (!response.headersSent) {
          sendText(response, 500, "Unable to read the requested file.");
        } else {
          response.destroy();
        }
      });
      stream.pipe(response);
    } catch (error) {
      if (error?.code === "ENOENT" || error?.code === "ENOTDIR" || error?.code === "EACCES") {
        sendText(response, 404, "Not found.");
        return;
      }
      sendText(response, 500, "Preview server encountered an unexpected error.");
    }
  });
}

function startPreviewServer() {
  const rawPort = process.env.PORT ?? process.argv[2] ?? "8000";
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  const server = createPreviewServer();
  server.listen(port, "127.0.0.1", () => {
    console.log(`Agency preview: http://127.0.0.1:${port}/`);
    console.log("Bound to localhost only. PHP endpoints are not executed by this preview.");
    console.log("Press Ctrl+C to stop.");
  });

  const shutdown = () => server.close(() => process.exit(0));
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startPreviewServer();
}
