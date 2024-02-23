/**
 * @file logRoute.ts
 * @author Philippe Tang
 * @date 2024-02-22
 * @description Log endpoints
 */
import { LogController } from "@/api/v1/controllers/logController";
import { LogService } from "@/api/v1/services/logService";
import express from "express";

export default (router: express.Router) => {
  const logService = new LogService();
  const logController = new LogController(logService);
  router.get(
    "/logs",
    (req, res) => void logController.getLogs(req, res).catch(console.error),
  );
};
