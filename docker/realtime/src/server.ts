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
export type Audience = "spymaster" | "agent" | "ai";
const AUDIENCES: Audience[] = ["spymaster", "agent"];

type Clue = {
    word: string;
    count: number;
    team: string;
};

type GameView = {
    version: number;
    turn: string;
    clue: Clue | null;
    cards: (string | null)[];
    found: boolean[];
    lastFound: number | null;
    remaining: {
        red: number;
        blue: number;
    };
    gameOver: boolean;
    winner: string | null;
};

export type IAGame = {
    agent_fmotte_teams: string[];
    current_turn: string;
};

type BroadcastViews = {
    spymaster: GameView;
    agent: GameView;
    ai: IAGame;
};

type BroadcastBody = {
    code: string;
    views: BroadcastViews;
};

// Spectators see what operatives see
function audienceOf(seat: unknown): Audience {
  return typeof seat === "string" && seat.endsWith("-spymaster") ? "spymaster" : "agent";
}

function channel(code: string, audience: Audience): string {
  return `${code.trim().toUpperCase()}:${audience}`;
}

const CHAT_MAX_LENGTH = 200;
const CHAT_NAME_MAX = 32;
const CHAT_HISTORY = 50;

type ChatMessage = {
  id: string;
  name: string;
  seat: string;
  text: string;
  at: number;
};

const chatHistory = new Map<string, ChatMessage[]>();

function chatChannel(code: string): string {
  return `${code.trim().toUpperCase()}:chat`;
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
    const body = await readJson(req).catch((err) => {
      console.error("JSON parsing error:", err);
      return null;
    });

    if (!isBroadcastBody(body)) {
      console.error("Invalid broadcast body:", body);

      res.writeHead(400);
      res.end();
      return;
    }

    const view = body.views.ai;

    // Only ask the AI once per turn: after its clue, its operatives keep playing the same turn
    const shouldPlay = view?.agent_fmotte_teams?.includes(view.current_turn) && !body.views.spymaster?.clue;

    if (shouldPlay) {

      try {
        const response = await fetch("http://ia:8001", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(view)
        });

        if (!response.ok) {
            console.error("AI request failed:", response.status);
        } else {
            const result = await response.json();

            // Same clue and version as Game.giveClue() in Next, which saves it from our answer
            const clue: Clue = {
              word: String(result.clue).trim().toUpperCase(),
              count: Number(result.number),
              team: view.current_turn
            };
            for (const audience of AUDIENCES) {
              body.views[audience].clue = { ...clue };
              body.views[audience].version++;
            }
        }

      } catch (error) {
        console.error("Failed to contact AI server:", error);
      }
    }

    for (const audience of AUDIENCES) {
      const channelName = channel(body.code, audience);
      io.to(channelName).emit("state", body.views[audience]);
    }


    res.writeHead(200, {
		"Content-Type": "application/json"
	});

	res.end(JSON.stringify(body));
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
  socket.join(channel(code, audienceOf(seat)));

  const room = chatChannel(code);
  socket.join(room);

  socket.on("chat:history", (reply: unknown) => {
    if (typeof reply === "function") {
      reply(chatHistory.get(room) ?? []);
    }
  });

  socket.on("chat", (payload: unknown) => {
    const { name, text } = (payload ?? {}) as { name?: unknown; text?: unknown };
    if (typeof text !== "string") {
      return;
    }
    const cleanText = text.trim().slice(0, CHAT_MAX_LENGTH);
    if (!cleanText) {
      return;
    }
    // TODO: Take the name from the next-auth session too, the client can lie about it
    const cleanName = typeof name === "string" && name.trim() ? name.trim().slice(0, CHAT_NAME_MAX) : "Anonymous";

    const message: ChatMessage = {
      id: `${Date.now()}-${socket.id}`,
      name: cleanName,
      seat: typeof seat === "string" ? seat : "spectator",
      text: cleanText,
      at: Date.now(),
    };

    const history = chatHistory.get(room) ?? [];
    history.push(message);
    chatHistory.set(room, history.slice(-CHAT_HISTORY));

    io.to(room).emit("chat", message);
  });

  socket.on("disconnect", () => {
    if (!io.sockets.adapter.rooms.get(room)?.size) {
      chatHistory.delete(room);
    }
  });
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
