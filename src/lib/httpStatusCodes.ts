/* Defines standard http status codes according to https://developer.mozilla.org/en-US/docs/Web/HTTP/Status */

/* 2xx Success */
export const STATUS_OK = 200;
export const STATUS_CREATED = 201;

/* 4xx Client Error */
export const STATUS_BAD_REQUEST = 400;
export const STATUS_FORBIDDEN = 403;
export const STATUS_METHOD_NOT_ALLOWED = 405;

/* 5xx Server Error */
export const STATUS_SERVER_ERROR = 500;

/* Single object with all statuses makes the importing a lot less messy */
export const HTTP_STATUS = {
  /* 2xx Success */
  OK: 200,
  CREATED: 201,

  /* 4xx Client Error */
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  NOT_ALLOWED: 405,

  /* 5xx Server Error */
  SERVER_ERROR: 500
};