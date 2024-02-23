/**
 * @file httpStatusCodes.ts
 * @author Philippe Tang
 * @date 2024-02-22
 */

enum HttpStatusCode {
  OK = 200,
  BadRequest = 400,
  NotFound = 404,
  MethodNotAllowed = 405,
  InternalServerError = 500,
}

export default HttpStatusCode;
