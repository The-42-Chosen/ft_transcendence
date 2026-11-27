import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage } from "node:http";
import { Server } from "socket.io";


const PORT = Number(process.env.PORT ?? 3001);

const CORS_ORIGINS = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const MAX_BODY_SIZE = 100_000;

const AUTH_SECRET = process.env.AUTH_SECRET;
if (!AUTH_SECRET) {
  console.error("AUTH_SECRET is not set");
  process.exit(1);
}

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


function audienceOf(seat: unknown): Audience {
  return typeof seat === "string" && seat.endsWith("-spymaster") ? "spymaster" : "agent";
}

function channel(code: string, audience: Audience): string {
  return `${code.trim().toUpperCase()}:${audience}`;
}


type Claims = {
  code: string;
  playerId: string | null;
  name: string | null;
  seat: string;
  exp: number;
};

const SEATS = ["red-spymaster", "red-operative", "blue-spymaster", "blue-operative", "spectator"];

function verifyToken(token: unknown): Claims | null {
  if (typeof token !== "string") {
    return null;
  }
  const [data, signature] = token.split(".");
  if (!data || !signature) {
    return null;
  }

  const expected = Buffer.from(createHmac("sha256", AUTH_SECRET!).update(`realtime:${data}`).digest("base64url"));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null;
  }
  try {
    const claims = JSON.parse(Buffer.from(data, "base64url").toString()) as Partial<Claims>;
    if (typeof claims.code !== "string" || typeof claims.exp !== "number" || claims.exp < Date.now()) {
      return null;
    }
    return {
      code: claims.code,
      playerId: typeof claims.playerId === "string" ? claims.playerId : null,
      name: typeof claims.name === "string" ? claims.name : null,
      seat: SEATS.includes(claims.seat as string) ? (claims.seat as string) : "spectator",
      exp: claims.exp,
    };
  } catch {
    return null;
  }
}

// ---- Chat ----

const CHAT_MAX_LENGTH = 200;
const CHAT_NAME_MAX = 32;
const CHAT_HISTORY = 50;

type ChatChannel = "room" | "spymasters";
const CHAT_CHANNELS: ChatChannel[] = ["room", "spymasters"];

type ChatMessage = {
  id: string;
  channel: ChatChannel;
  playerId: string;
  name: string;
  seat: string;
  text: string;
  at: number;
};

const chatHistory = new Map<string, ChatMessage[]>();

function chatChannel(code: string, chat: ChatChannel): string {
  return `${code.trim().toUpperCase()}:chat:${chat}`;
}

function isChatChannel(value: unknown): value is ChatChannel {
  return CHAT_CHANNELS.includes(value as ChatChannel);
}

function canReadChat(chat: ChatChannel, seat: string): boolean {
  return chat === "room" || audienceOf(seat) === "spymaster";
}

function canWriteChat(chat: ChatChannel, seat: string): boolean {
  return (chat === "spymasters") === (audienceOf(seat) === "spymaster");
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

    // Check if IA must play
    const shouldPlay = view?.agent_fmotte_teams?.includes(view.current_turn) && !body.views.spymaster?.clue;

    if (shouldPlay) {

      try {
        const response = await fetch("http://ia:8001", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ ...view, code: body.code })
        });

        if (!response.ok) {
            console.error("AI request failed:", response.status);
        } else {
            const result = await response.json();

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

    if (body.views.spymaster?.gameOver && view?.agent_fmotte_teams?.length) {
      fetch("http://ia:8001/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: body.code })
      }).catch((error) => console.error("Failed to clear AI history:", error));
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

io.use((socket, next) => {
  const claims = verifyToken(socket.handshake.auth?.token);
  if (!claims) {
    next(new Error("Unauthorized"));
    return;
  }
  socket.data.claims = claims;
  next();
});

io.on("connection", (socket) => {
  const { code, playerId, name, seat } = socket.data.claims as Claims;
  socket.join(channel(code, audienceOf(seat)));

  for (const chat of CHAT_CHANNELS) {
    if (canReadChat(chat, seat)) {
      socket.join(chatChannel(code, chat));
    }
  }

  socket.on("chat:history", (chat: unknown, reply: unknown) => {
    if (typeof reply !== "function") {
      return;
    }
    reply(isChatChannel(chat) && canReadChat(chat, seat) ? chatHistory.get(chatChannel(code, chat)) ?? [] : []);
  });

  socket.on("chat", (payload: unknown) => {
    const { channel: chat, text } = (payload ?? {}) as { channel?: unknown; text?: unknown };
    if (!playerId || !isChatChannel(chat) || !canWriteChat(chat, seat)) {
      return;
    }
    if (typeof text !== "string") {
      return;
    }
    const cleanText = text.trim().slice(0, CHAT_MAX_LENGTH);
    if (!cleanText) {
      return;
    }
    const cleanName = name?.trim().slice(0, CHAT_NAME_MAX) || "Anonymous";

    const message: ChatMessage = {
      id: `${Date.now()}-${socket.id}`,
      channel: chat,
      playerId,
      name: cleanName,
      seat,
      text: cleanText,
      at: Date.now(),
    };

    const target = chatChannel(code, chat);
    const history = chatHistory.get(target) ?? [];
    history.push(message);
    chatHistory.set(target, history.slice(-CHAT_HISTORY));

    io.to(target).emit("chat", message);
  });

  socket.on("disconnect", () => {
    if (!io.sockets.adapter.rooms.get(chatChannel(code, "room"))?.size) {
      for (const chat of CHAT_CHANNELS) {
        chatHistory.delete(chatChannel(code, chat));
      }
    }
  });
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Realtime server listening on :${PORT}`);
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    io.close(() => process.exit(0));
  });
}
