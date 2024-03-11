/* eslint no-unused-labels: "off" */

/* eslint @typescript-eslint/no-unsafe-member-access: "off" */

/* eslint @typescript-eslint/no-unsafe-call: "off" */

/* eslint @typescript-eslint/no-unsafe-return: "off" */
import app, { server } from "@/index";
import path from "path";
import request from "supertest";

const VAR_LOG_DIR = process.env.VAR_LOG_DIR ?? path.join(__dirname, "samples");

// Set smaller chunk size for text clipping scenarios
jest.mock("@/api/v1/configs/logConfig", () => ({
  ...jest.requireActual("@/api/v1/configs/logConfig"),
  DEFAULT_BUFFER_CHUNK_SIZE_BYTES: 10,
}));

describe("GET /api/v1/logs", () => {
  // Close the expressjs server once all tests are completed
  afterAll(() => {
    server.close();
  });

  it("400 Bad Request - Retrieve logs with missing filename query param", async () => {
    const response = await request(app).get("/api/v1/logs");
    expect(response.statusCode).toBe(400);
    expect(response.body.errors[0].source.parameter).toEqual("filename");
  });

  it("404 Not Found - File not found on the server", async () => {
    const query = {
      filename: "does_not_exist.sample",
    };
    const response = await request(app).get("/api/v1/logs").query(query);
    expect(response.statusCode).toBe(404);
    expect(response.body.errors[0].title).toEqual("File Not Found");
  });

  it("200 OK - Retrieve logs with default query params", async () => {
    const query = {
      filename: "linux_2k.sample",
    };
    const response = await request(app).get("/api/v1/logs").query(query);
    expect(response.statusCode).toBe(200);
    expect(response.body.log.filename).toEqual(
      path.join(VAR_LOG_DIR, "linux_2k.sample"),
    );
    expect(response.body.log.count).toEqual(10);
    expect(response.body.log.events).toHaveLength(10);
  });

  it("200 OK - Retrieve latest 5 lines of log file", async () => {
    const query = {
      filename: "linux_2k.sample",
      n: 5,
    };
    const response = await request(app).get("/api/v1/logs").query(query);
    expect(response.statusCode).toBe(200);
    expect(response.body.log.filename).toEqual(
      path.join(VAR_LOG_DIR, "linux_2k.sample"),
    );
    expect(response.body.log.count).toEqual(5);
    expect(response.body.log.events).toHaveLength(5);
  });

  it("200 OK - Retrieve n=100 filter=pci", async () => {
    const query = {
      filename: "linux_2k.sample",
      n: 100,
      filter: "pci",
    };
    const response = await request(app).get("/api/v1/logs").query(query);
    expect(response.statusCode).toBe(200);
    expect(response.body.log.filename).toEqual(
      path.join(VAR_LOG_DIR, "linux_2k.sample"),
    );
    expect(response.body.log.count).toEqual(9);
    expect(response.body.log.events).toHaveLength(9);
    response.body.log.events.forEach((element: string) => {
      expect(element).toMatch(/pci/i);
    });
  });

  it("200 OK - No empty lines", async () => {
    const query = {
      filename: "withEmptyLines.sample",
      n: 1000,
    };
    const response = await request(app).get("/api/v1/logs").query(query);
    expect(response.statusCode).toBe(200);
    expect(response.body.log.filename).toEqual(
      path.join(VAR_LOG_DIR, "withEmptyLines.sample"),
    );
    expect(response.body.log.count).toEqual(223);
    expect(response.body.log.events).toHaveLength(223);
    response.body.log.events.forEach((element: string) => {
      expect(element).not.toBe("");
    });
  });
});
