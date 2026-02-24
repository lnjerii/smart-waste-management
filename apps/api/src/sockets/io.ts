import { Server } from "socket.io";

export let io: Server;

export function initIo(server: any) {
  io = new Server(server, {
    cors: {
      origin: "*"
    }
  });

  io.on("connection", (socket) => {
    socket.emit("connected", { ok: true, ts: Date.now() });
  });
}
