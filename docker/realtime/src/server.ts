import { createServer, type IncomingMessage } from "node:http";
import { Server } from "socket.io";

// This service holds no game: Next checks every move, changes the Game, then POSTs the new
// state to /broadcast. This service only forwards it to the browsers of the room.

const PORT = Number(process.env.PORT ?? 3001);

const CORS_ORIGINS = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const MAX_BODY_SIZE = 100_000;

// Same split as audienceOf() in docker/next/src/lib/game.ts
type Audience = "spymaster" | "agent";
const AUDIENCES: Audience[] = ["spymaster", "agent"];

type BroadcastBody = {
  code: string;
  views: Record<Audience, unknown>;
};

// Spectators see what operatives see
function audienceOf(seat: unknown): Audience {
  return typeof seat === "string" && seat.endsWith("-spymaster") ? "spymaster" : "agent";
}

function channel(code: string, audience: Audience): string {
  return `${code.trim().toUpperCase()}:${audience}`;
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  let data = "";
  for await (const chunk of req) {
    data += chunk;
    if (data.length > MAX_BODY_SIZE) {
      throw new Error("Body too large");
    }
  }
  return JSON.parse(data);
}

function isBroadcastBody(body: unknown): body is BroadcastBody {
  const { code, views } = (body ?? {}) as Partial<BroadcastBody>;
  return typeof code === "string" && typeof views === "object" && views !== null;
}

const httpServer = createServer(async (req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  if (req.method === "POST" && req.url === "/broadcast") {
    const body = await readJson(req).catch(() => null);
    if (!isBroadcastBody(body)) {
      res.writeHead(400);
      res.end();
      return;
    }
    for (const audience of AUDIENCES) {
      io.to(channel(body.code, audience)).emit("state", body.views[audience]);
    }
    res.writeHead(204);
    res.end();
    return;
  }
  res.writeHead(404);
  res.end();
});

const io = new Server(httpServer, {
  path: "/socket.io",
  cors: CORS_ORIGINS.length ? { origin: CORS_ORIGINS } : undefined,
});

io.on("connection", (socket) => {
  const { code, seat } = socket.handshake.query;
  if (typeof code !== "string") {
    socket.disconnect(true);
    return;
  }
  // TODO: Take the seat from the next-auth session once seats are saved, the client can lie about it
  socket.join(channel(code, audienceOf(seat)));
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Realtime server listening on :${PORT}`);
});

// Arret propre quand podman stoppe le conteneur.
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    io.close(() => process.exit(0));
  });
}
