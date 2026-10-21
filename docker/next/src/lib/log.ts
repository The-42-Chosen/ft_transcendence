import 'server-only';
import net from 'node:net';

type Level = 'debug' | 'info' | 'warn' | 'error';

// Champs autorisÃ©s.
// Regle d'equipe : un meme nom d'extra doit garder le meme type partout
// (ex. `score` toujours un nombre), sinon le document est rejete.
export interface LogFields {
  service: 'auth' | 'game' | 'chat' | 'tournament' | 'api';
  msg: string;
  user_id?: number;
  request_id?: string;
  duration_ms?: number;
  error?: string;
  [extra: string]: unknown;
}

const HOST = process.env.LOGSTASH_HOST ?? 'logstash';
const PORT = Number(process.env.LOGSTASH_PORT ?? 5000);

let socket: net.Socket | null = null;
let connected = false;
let pending: string[] = [];

function connect() {
  socket = net.createConnection({ host: HOST, port: PORT });
  socket.setKeepAlive(true);
  socket.on('connect', () => {
    connected = true;
    for (const line of pending) socket!.write(line);
    pending = [];
  });
  socket.on('error', () => {});
  socket.on('close', () => {
    connected = false;
    socket = null;
    setTimeout(connect, 5000).unref();
  });
}

function emit(level: Level, fields: LogFields) {
  const { service, msg, error, user_id, request_id, duration_ms, ...extra } = fields;
  const event = {
    '@timestamp': new Date().toISOString(),
    level,
    msg,
    service: { name: service },
    ...(error !== undefined && { error: { message: error } }),
    ...(user_id !== undefined && { user_id }),
    ...(request_id !== undefined && { request_id }),
    ...(duration_ms !== undefined && { duration_ms }),
    ...(Object.keys(extra).length > 0 && { app: extra }),
  };
  const line = JSON.stringify(event) + '\n';

  process.stdout.write(line);

  if (!socket) connect();
  if (connected) socket!.write(line);
  else if (pending.length < 1000) pending.push(line);
}

export const log = {
  debug: (f: LogFields) => emit('debug', f),
  info:  (f: LogFields) => emit('info', f),
  warn:  (f: LogFields) => emit('warn', f),
  error: (f: LogFields) => emit('error', f),
};