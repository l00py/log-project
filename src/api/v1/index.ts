/**
 * @file index.ts
 * @author Philippe Tang
 * @date 2024-02-22
 * @description Exposes the list of routes
 */
import logs from "@/api/v1/routes/logRoute";
import express from "express";

const router = express.Router();

export default (): express.Router => {
  // Endpoint: /logs
  logs(router);

  return router;
};
