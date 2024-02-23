/**
 * @file jsonApiInterface.ts
 * @author Philippe Tang
 * @date 2024-02-22
 * @description Json object response format
 */

export interface JsonApiErrorSource {
  parameter?: string;
}

export interface JsonApiError {
  status: number;
  source?: JsonApiErrorSource;
  title: string;
  detail?: string;
}

export interface JsonApiErrorResponse {
  errors: JsonApiError[];
}
