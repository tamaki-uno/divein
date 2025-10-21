
import Fastify from "fastify";
import fastiSensible from "@fastify/sensible";
import fastifyStatic from "@fastify/static";
import path from "path";
import dotenv from "dotenv";

import {} from './db.js'
import apiServer from "./api.js";

const __dirname = path.resolve();

dotenv.config(); // Load environment variables from .env file
const port = process.env.PORT;
// const port = 3000;


console.log("Starting DIVEIN server...", __dirname, port);

const fastify = Fastify({ logger: true});
//   logger: true,
// });
fastify.register(fastiSensible);

// fastify.register(fastifyStatic, path.join(__dirname, "app")); // ReferenceError: __dirname is not defined in ES module scope
fastify.register(fastifyStatic, { root: path.join(__dirname, "/app") });
// fastify.register(fastifyStatic, {
//   // root: path.join(__dirname, "app"),
//   root: '../app',
//   // prefix: '/'
// });

// fastify.get("/", async (request, reply) => {
//   return { hello: "world" };
// });

fastify.register(apiServer, { prefix: "/api" });

const start = async () => {
  try {
    await fastify.listen({ port: port, host: "0.0.0.0" });
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();