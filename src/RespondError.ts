import { ErrorResponseCode } from './respond.types';
import { Class } from '@babel/types';

export enum Classification {
  DATABASE = 'DATABASE',
  DOWNSTREAM = 'DOWNSTREAM',
  ENTITLEMENT = 'ENTITLEMENT',
  OTHER = 'OTHER',
  VALIDATION = 'VALIDATION'
};

const formatName = (s: string) => {
  if (s) {
    return `${s.charAt(0).toUpperCase()} ${s.slice(1).toLowerCase()}`;
  }
  return '';
};

export default class RespondError extends Error {
  private _message: string;
  private _statusCode: ErrorResponseCode;
  private _classification: Classification;
  private _loggingMessage: string;

  constructor(message: string)
  constructor(message: string, classification: Classification)
  constructor(message: string, classification: Classification, statusCode: ErrorResponseCode)
  constructor(message: string, classification: Classification, statusCode: ErrorResponseCode, loggingMessage: string)
  constructor(message: string, classification?: Classification, statusCode?: ErrorResponseCode, loggingMessage?: string) {
    super(message);
    this._message = message;
    this._classification = classification;
    this._statusCode = statusCode || 500;
    this.name = `${formatName(classification)}Error`;
    this._loggingMessage = loggingMessage || undefined;
  }

  public set classification(classifiation: Classification) {
    this._classification = classifiation;
  }

  public get classification(): Classification {
    return this._classification;
  }

  public get message(): string {
    return this._message;
  }

  public set statusCode(statusCode: ErrorResponseCode) {
    this._statusCode = statusCode;
  }

  public get statusCode(): ErrorResponseCode {
    return this._statusCode;
  }

  public set loggingMessage(loggingMessage: string) {
    this._loggingMessage = loggingMessage
  }

  public get loggerMessage(): string {
    return this._loggingMessage;
  }
}