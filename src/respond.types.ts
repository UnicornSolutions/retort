const successCodes = [
  200,
  201,
  202,
  203,
  204,
  205,
  206,
  207,
  208,
  226
];
export type SuccessResponseCode = (typeof successCodes)[number];
export const isSuccessCode = (x: any): x is SuccessResponseCode => successCodes.includes(x);

const errCodes = [
  400,
  401,
  402,
  403,
  404,
  405,
  406,
  407,
  408,
  409,
  410,
  411,
  412,
  413,
  414,
  415,
  416,
  417,
  418,
  421,
  422,
  423,
  424,
  425,
  426,
  428,
  429,
  431,
  451,
  500,
  501,
  502,
  503,
  504,
  505,
  506,
  507,
  508,
  510,
  511
];
export type ErrorResponseCode = (typeof errCodes)[number];
export const isErrorCode = (x: any): x is ErrorResponseCode => errCodes.includes(x);

export enum ResponseLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  SUCCESS = 'SUCCESS'
}