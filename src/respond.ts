import RespondError, { Classification } from './RespondError';
import { ErrorResponseCode, SuccessResponseCode, ResponseLevel, isErrorCode, isSuccessCode } from './respond.types';

export interface RespondObject {
  code: number;
  message: string;
  level: ResponseLevel;
}

export interface Response {
  statusCode: number;
  headers: {
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Credentials': boolean;
  };
  body: string;
}

const buildRespondObject = (code: number, message: any, level: ResponseLevel): RespondObject => {
  return {
    code,
    message,
    level
  };
};

const buildResponse = (responseBody: any, httpCode?: number): Response => {
  return {
    statusCode: httpCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(responseBody)
  };
};

class Respond {
  _responseMessage: string;
  _classification: Classification;
  _error: RespondError | Error;
  _loggingMessage: string;
  _statusCode: ErrorResponseCode | SuccessResponseCode;

  constructor(responseMessage: string)
  constructor(error: RespondError)
  constructor(error: Error, classification: Classification)
  constructor(error: Error, classification: Classification, loggingMessage: string)
  constructor(errorOrResp?: Error | RespondError | string, classification?: Classification, loggingMessage?: string) {
    if (typeof errorOrResp == 'string') {
      this._responseMessage = errorOrResp;
    } else if (errorOrResp instanceof RespondError) {
      this._responseMessage = errorOrResp.message;
      this._classification = errorOrResp.classification;
      this._statusCode = errorOrResp.statusCode;
      this._error = errorOrResp;
      this._loggingMessage = errorOrResp.loggingMessage;
    } else {
      if (typeof errorOrResp !== 'string') {
        this._error = errorOrResp;
        this._responseMessage = errorOrResp.message;
      }
      this._classification = classification;
      this._loggingMessage = loggingMessage;
    }
  }

  public static withRespondError(error: RespondError) {
    return new Respond(error);
  }

  public static withResponseMessage(responseMessage: string) {
    return new Respond(responseMessage);
  }

  public static send(responseMessage: string, httpCode: number)
  public static send(responseMessage: string, httpCode: number, responseLevel: ResponseLevel)
  public static send(responseData: object)
  public static send(responseData: object, httpCode: number)
  public static send(responseData: object, httpCode: number, responseLevel: ResponseLevel)
  public static send(responseDataOrMessage: string | object, httpCode?: number, responseLevel?: ResponseLevel): Response {
    let respLev;
    if((httpCode && isErrorCode(httpCode)) || (responseDataOrMessage['code'] && isErrorCode(responseDataOrMessage['code']))) {
      respLev = ResponseLevel.ERROR;
    }

    if ((httpCode && isSuccessCode(httpCode)) || (responseDataOrMessage['code'] && isSuccessCode(responseDataOrMessage['code']))) {
      respLev = ResponseLevel.SUCCESS;
    }

    let message, responseBody;
    if (typeof responseDataOrMessage === 'string') {
      message = responseDataOrMessage;
      responseBody = {
        message
      };
    } else if (typeof responseDataOrMessage === 'object') {
      message = responseDataOrMessage['message'] ? responseDataOrMessage['message'] : '';
      responseBody = responseDataOrMessage;
    }
    responseBody['riposte'] = buildRespondObject(httpCode || responseDataOrMessage['code'], message, responseLevel || respLev);
    return buildResponse(responseBody, httpCode || responseDataOrMessage['code']);
  }

  public static badRequest();
  public static badRequest(respondError: RespondError);
  public static badRequest(responseMessage: string);
  public static badRequest(responseMessage: string, classification: Classification);
  public static badRequest(responseMessage: string, classification: Classification, err: Error): Response;
  public static badRequest(responseMessage: string, classification: Classification, err: Error, loggerMessage: string): Response;
  public static badRequest(RespondErrOrResp?: RespondError | string, classification?: Classification, err?: Error, loggerMessage?: string): Response {
    if (typeof RespondErrOrResp === 'string') {
      const responseMessage = RespondErrOrResp;
      if (err) {
        return this.error(err, responseMessage, 400, classification, loggerMessage);
      }
      return this.error(new RespondError(responseMessage, classification, 400));
    } else if (RespondErrOrResp instanceof RespondError) {
      const obpErr = RespondErrOrResp;
      obpErr.statusCode = 400;
      return Respond.error(obpErr);
    }
  }

  public static unauthorized();
  public static unauthorized(obpError: RespondError);
  public static unauthorized(responseMessage: string);
  public static unauthorized(responseMessage: string, classification: Classification);
  public static unauthorized(responseMessage: string, classification: Classification, err: Error): Response;
  public static unauthorized(responseMessage: string, classification: Classification, err: Error, loggerMessage: string): Response;
  public static unauthorized(RespondErrOrResp?: RespondError | string, classification?: Classification, err?: Error, loggerMessage?: string): Response {
    if (typeof RespondErrOrResp === 'string') {
      const responseMessage = RespondErrOrResp;
      if (err) {
        return this.error(err, responseMessage, 401, classification, loggerMessage);
      }
      return this.error(new RespondError(responseMessage, classification, 401));
    } else if (RespondErrOrResp instanceof RespondError) {
      const obpErr = RespondErrOrResp;
      obpErr.statusCode = 401;
      return Respond.error(obpErr);
    }
  }

  public static forbidden();
  public static forbidden(obpError: RespondError);
  public static forbidden(responseMessage: string);
  public static forbidden(responseMessage: string, classification: Classification);
  public static forbidden(responseMessage: string, classification: Classification, err: Error): Response;
  public static forbidden(responseMessage: string, classification: Classification, err: Error, loggerMessage: string): Response;
  public static forbidden(RespondErrOrResp?: RespondError | string, classification?: Classification, err?: Error, loggerMessage?: string): Response {
    if (typeof RespondErrOrResp === 'string') {
      const responseMessage = RespondErrOrResp;
      if (err) {
        return this.error(err, responseMessage, 403, classification, loggerMessage);
      }
      return this.error(new RespondError(responseMessage, classification, 403));
    } else if (RespondErrOrResp instanceof RespondError) {
      const obpErr = RespondErrOrResp;
      obpErr.statusCode = 403;
      return Respond.error(obpErr);
    }
  }

  public static notFound();
  public static notFound(obpError: RespondError);
  public static notFound(responseMessage: string);
  public static notFound(responseMessage: string, classification: Classification);
  public static notFound(responseMessage: string, classification: Classification, err: Error): Response;
  public static notFound(responseMessage: string, classification: Classification, err: Error, loggerMessage: string): Response;
  public static notFound(RespondErrOrResp?: RespondError | string, classification?: Classification, err?: Error, loggerMessage?: string): Response {
    if (typeof RespondErrOrResp === 'string') {
      const responseMessage = RespondErrOrResp;
      if (err) {
        return this.error(err, responseMessage, 404, classification, loggerMessage);
      }
      return this.error(new RespondError(responseMessage, classification, 404));
    } else if (RespondErrOrResp instanceof RespondError) {
      const obpErr = RespondErrOrResp;
      obpErr.statusCode = 404;
      return Respond.error(obpErr);
    }
  }

  public static conflict();
  public static conflict(obpError: RespondError);
  public static conflict(responseMessage: string);
  public static conflict(responseMessage: string, classification: Classification);
  public static conflict(responseMessage: string, classification: Classification, err: Error): Response;
  public static conflict(responseMessage: string, classification: Classification, err: Error, loggerMessage: string): Response;
  public static conflict(RespondErrOrResp?: RespondError | string, classification?: Classification, err?: Error, loggerMessage?: string): Response {
    if (typeof RespondErrOrResp === 'string') {
      const responseMessage = RespondErrOrResp;
      if (err) {
        return this.error(err, responseMessage, 409, classification, loggerMessage);
      }
      return this.error(new RespondError(responseMessage, classification, 409));
    } else if (RespondErrOrResp instanceof RespondError) {
      const obpErr = RespondErrOrResp;
      obpErr.statusCode = 409;
      return Respond.error(obpErr);
    }
  }

  public static internalServerError();
  public static internalServerError(obpError: RespondError);
  public static internalServerError(responseMessage: string);
  public static internalServerError(responseMessage: string, classification: Classification);
  public static internalServerError(responseMessage: string, classification: Classification, err: Error): Response;
  public static internalServerError(responseMessage: string, classification: Classification, err: Error, loggerMessage: string): Response;
  public static internalServerError(RespondErrOrResp?: RespondError | string, classification?: Classification, err?: Error, loggerMessage?: string): Response {
    if (typeof RespondErrOrResp === 'string') {
      const responseMessage = RespondErrOrResp;
      if (err) {
        return this.error(err, responseMessage, 500, classification, loggerMessage);
      }
      return this.error(new RespondError(responseMessage, classification, 500));
    } else if (RespondErrOrResp instanceof RespondError) {
      const obpErr = RespondErrOrResp;
      obpErr.statusCode = 500;
      return Respond.error(obpErr);
    }
  }

  public static ok();
  public static ok(responseMessage: string);
  public static ok(responseBody: object);
  public static ok(responseBody: object, responseMessage: string);
  public static ok(messageOrBody?: string | object, responseMessage?: string): Response {
    if (typeof messageOrBody === 'object') {
      messageOrBody['riposte'] = buildRespondObject(200, responseMessage || '', ResponseLevel.SUCCESS);
      return buildResponse(messageOrBody, 200);
    } else {
      const resp = {
        riposte: buildRespondObject(200, messageOrBody || '', ResponseLevel.SUCCESS)
      };
      return buildResponse(resp, 200);
    }
  }

  public static created();
  public static created(responseMessage: string);
  public static created(responseBody: object);
  public static created(responseBody: object, responseMessage: string);
  public static created(messageOrBody?: string | object, responseMessage?: string): Response {
    if (typeof messageOrBody === 'object') {
      messageOrBody['riposte'] = buildRespondObject(201, responseMessage || '', ResponseLevel.SUCCESS);
      return buildResponse(messageOrBody, 201);
    } else {
      const resp = {
        riposte: buildRespondObject(201, messageOrBody || '', ResponseLevel.SUCCESS)
      };
      return buildResponse(resp, 201);
    }
  }

  public static noContent();
  public static noContent(responseMessage: string);
  public static noContent(responseBody: object);
  public static noContent(responseBody: object, responseMessage: string);
  public static noContent(messageOrBody?: string | object, responseMessage?: string): Response {
    if (typeof messageOrBody === 'object') {
      messageOrBody['riposte'] = buildRespondObject(204, responseMessage || '', ResponseLevel.SUCCESS);
      return buildResponse(messageOrBody, 204);
    } else {
      const resp = {
        riposte: buildRespondObject(204, messageOrBody || '', ResponseLevel.SUCCESS)
      };
      return buildResponse(resp, 204);
    }
  }

  public static notModified();
  public static notModified(responseMessage: string);
  public static notModified(responseBody: object);
  public static notModified(responseBody: object, responseMessage: string);
  public static notModified(messageOrBody?: string | object, responseMessage?: string): Response {
    if (typeof messageOrBody === 'object') {
      messageOrBody['riposte'] = buildRespondObject(304, responseMessage || '', ResponseLevel.SUCCESS);
      return buildResponse(messageOrBody, 304);
    } else {
      const resp = {
        riposte: buildRespondObject(304, messageOrBody || '', ResponseLevel.SUCCESS)
      };
      return buildResponse(resp, 304);
    }
  }

  public static error(err: RespondError, responseMessage?: string): Response;
  public static error(err: Error, responseMessage: string, statusCode: ErrorResponseCode, classification: Classification, loggerMessage?: string): Response;
  public static error(err: RespondError | Error, responseMessage?: string, statusCode?: ErrorResponseCode, classification?: Classification, loggerMessage?: string): Response {
    let meta, riposteObj;
    if (err instanceof RespondError) {
      meta = {
        error: {
          errorMessage: err.message,
          errorType: err.name,
          errorStack: err.stack
        },
        classification: err.classification
      };
      riposteObj = buildRespondObject(err.statusCode, responseMessage ? responseMessage : err.message, ResponseLevel.ERROR);
      return buildResponse(riposteObj, err.statusCode);
    }

    if (err instanceof Error) {
      meta = {
        error: {
          errorMessage: err.message,
          errorStack: err.stack,
          errorType: err.name
        },
        classification
      };
      riposteObj = buildRespondObject(statusCode, responseMessage, ResponseLevel.ERROR);
      return buildResponse(riposteObj, statusCode);
    }
  }
}

export default Respond;