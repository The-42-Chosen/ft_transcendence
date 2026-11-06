import { createServer } from "node:http";
import { Server } from "socket.io";

const PORT = Number(process.env.PORT ?? 3001);

// Origines autorisees en plus du meme domaine (ex : next-dev sur :3000).
// En prod, nginx sert tout sur le meme domaine donc rien a ajouter.
const CORS_ORIGINS = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Serveur HTTP minimal : /health pour le healthcheck, le reste est gere par Socket.IO.
const httpServer = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
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
  console.log("User connected", socket.id);

  // Le serveur relaie le message a tous les autres clients.
  socket.on("message", (msg) => {
    if (typeof msg !== "string") return;
    socket.broadcast.emit("message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
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
