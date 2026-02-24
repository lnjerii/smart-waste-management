import http from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { initIo } from "./sockets/io.js";

async function bootstrap() {
  await connectDb();

  const app = createApp();
  const server = http.createServer(app);

  initIo(server);

  server.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
