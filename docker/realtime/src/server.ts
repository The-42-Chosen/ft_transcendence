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
  console.log("\n========== REQUEST ==========");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", req.headers);

  if (req.url === "/health") {
    console.log("Health check received");

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (req.method === "POST" && req.url === "/broadcast") {
    const body = await readJson(req).catch((err) => {
      console.log("JSON parsing error:", err);
      return null;
    });

    console.log("Received body:", JSON.stringify(body, null, 2));

    if (!isBroadcastBody(body)) {
      console.log("Invalid broadcast body:", body);

      res.writeHead(400);
      res.end();
      return;
    }

    console.log("Broadcast code:", body.code);
    console.log("Broadcast views:", body.views);

    const view = body.views.ai;

    console.log("AI VIEW:", view);
    console.log("TEAMS:", view?.agent_fmotte_teams);
    console.log("TURN:", view?.current_turn);

    const shouldPlay = view?.agent_fmotte_teams?.includes(view.current_turn);

    console.log("SHOULD PLAY:", shouldPlay);

    if (shouldPlay) {
      console.log("AI PLAY-----------------------");

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
            console.log("AI request successfully sent!");
            const result = await response.json();
            console.log("AI response:", result);

            body.views.agent.clue = {
              	word: result.clue,
              	count: result.number,
              	team: view.current_turn
          	};

			body.views.spymaster.clue = {
				word: result.clue,
				count: result.number,
				team: view.current_turn
			};
        }

      } catch (error) {
        console.error("Failed to contact AI server:", error);
      }
    }

    for (const audience of AUDIENCES) {
      const channelName = channel(body.code, audience);
      console.log(`Emitting to channel: ${channelName}`);
      console.log("Payload:", body.views[audience]);

      io.to(channelName).emit("state", body.views[audience]);
    }

    console.log("Broadcast completed successfully");

    res.writeHead(200, {
		"Content-Type": "application/json"
	});

	res.end(JSON.stringify(body));
    return;
  }

  console.log("404 - Route not found:", req.method, req.url);

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
