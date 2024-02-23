/**
 * @file logController.ts
 * @author Philippe Tang
 * @date 2024-02-22
 * @description Log controller for the `/logs` endpoint
 */
import { VAR_LOG_DIR } from "@/api/v1/configs/logConfig";
import { JsonApiErrorResponse } from "@/api/v1/interfaces/jsonApiInterface";
import { LogResponse } from "@/api/v1/interfaces/logInterface";
import { LogService } from "@/api/v1/services/logService";
import HttpStatusCode from "@/api/v1/utils/httpStatusCodes";
import Logger from "@/api/v1/utils/logger";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const logger = Logger.child({ component: "LogController" });

export class LogController {
  constructor(private logService: LogService) {}

  async getLogs(req: Request, res: Response): Promise<void> {
    const { n, filter } = req.query;
    const filename = req.query.filename as string;

    // Validate query param: filename
    if (!filename) {
      const errorResponse: JsonApiErrorResponse = {
        errors: [
          {
            status: HttpStatusCode.BadRequest,
            source: { parameter: "filename" },
            title: "Missing Required Query Parameter",
            detail:
              "The `filename` query parameter is required but was not provided.",
          },
        ],
      };
      logger.info(errorResponse);
      res.status(HttpStatusCode.BadRequest).send(errorResponse);
      return;
    }

    // Process log file
    const filePath = path.resolve(VAR_LOG_DIR, filename);
    try {
      // Validate if file exists
      if (!fs.existsSync(filePath)) {
        const errorResponse: JsonApiErrorResponse = {
          errors: [
            {
              status: HttpStatusCode.NotFound,
              source: { parameter: "filename" },
              title: "File Not Found",
              detail: `The provided filename=${filename} does not exist on the server.`,
            },
          ],
        };
        logger.info(errorResponse);
        res.status(HttpStatusCode.NotFound).send(errorResponse);
        return;
      }

      const nEntries = typeof n === "string" && !isNaN(+n) ? +n : undefined;
      const fileContent: string[] = await this.logService.tailLog({
        filePath,
        n: nEntries,
        filterKeyword: filter?.toString(),
      });
      const logResponse: LogResponse = {
        log: {
          filename: path.join(VAR_LOG_DIR, filename.toString()),
          count: fileContent.length,
          events: fileContent,
        },
      };
      logger.info(`Retrieved filename=${filename} successfully`);
      res.status(HttpStatusCode.OK).json(logResponse);
      return;
    } catch (err) {
      console.error(err);
      const errorResponse: JsonApiErrorResponse = {
        errors: [
          {
            status: HttpStatusCode.NotFound,
            title: "Internal Server Error",
          },
        ],
      };
      logger.error(errorResponse);
      res.status(HttpStatusCode.InternalServerError).send(errorResponse);
      return;
    }
  }
}
