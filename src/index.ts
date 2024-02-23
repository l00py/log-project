/**
 * @file index.ts
 * @author Philippe Tang
 * @date 2024-02-22
 * @description REST API using expressjs.
 */
import routesV1 from "@/api/v1";
import logger from "@/api/v1/utils/logger";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { pinoHttp } from "pino-http";

dotenv.config();

const PORT = process.env.SERVER_PORT ?? 3000;

const app = express();
app.use(express.json());
app.use(pinoHttp({ logger }));

// Exporting it so that jest can properly terminate (close) the server
export const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use("/api/v1", routesV1());

export default app;
