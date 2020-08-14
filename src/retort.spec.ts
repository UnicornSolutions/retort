import Retort from './retort';
import RespondError, { Classification } from './RespondError';
import { ResponseLevel } from './respond.types';

const expectStringifyEqual = (spy, expectedValue) => {
  expect(JSON.stringify(spy.calls.first().args[0])).toEqual(JSON.stringify(expectedValue));
};

describe('Retort', () => {
  describe('constructor methods', () => {
    it('responseMessage only', () => {
      const responseMessage = 'Test Response Message';

      const riposte = new Retort(responseMessage);

      expect(riposte._classification).toEqual(undefined);
      expect(riposte._responseMessage).toEqual(responseMessage);
      expect(riposte._error).toEqual(undefined);
      expect(riposte._loggingMessage).toEqual(undefined);
      expect(riposte._statusCode).toEqual(undefined);
    });

    it('RespondError only -- Message & Classification', () => {
      const errorMessage = 'Test Error Message';

      const responseErr = new RespondError(errorMessage, Classification.OTHER);
      const riposte = new Retort(responseErr);

      expect(riposte._responseMessage).toEqual(errorMessage);
      expect(riposte._classification).toEqual(Classification.OTHER);
      expect(riposte._error).toEqual(responseErr);
      expect(riposte._loggingMessage).toEqual(undefined);
      expect(riposte._statusCode).toEqual(500);
    });

    it('RespondError only -- Message ONLY', () => {
      const errorMessage = 'Test Error Message';

      const responseErr = new RespondError(errorMessage);
      const riposte = new Retort(responseErr);

      expect(riposte._responseMessage).toEqual(errorMessage);
      expect(riposte._classification).toEqual(undefined);
      expect(riposte._error).toEqual(responseErr);
      expect(riposte._loggingMessage).toEqual(undefined);
      expect(riposte._statusCode).toEqual(500);
    });

    it('Standard Error class with response message & classification', () => {
      const errorMessage = 'Test Server Error Message';

      const err = new Error(errorMessage);
      const riposte = new Retort(err, Classification.DOWNSTREAM);

      expect(riposte._responseMessage).toEqual(errorMessage);
      expect(riposte._classification).toEqual(Classification.DOWNSTREAM);
      expect(riposte._error).toEqual(err);
      expect(riposte._loggingMessage).toEqual(undefined);
      expect(riposte._statusCode).toEqual(undefined);
    });

    it('Standard Error class with response message, classification & loggerMessage', () => {
      const loggerMessage = 'Test logging message';
      const errorMessage = 'Test Server Error Message';

      const err = new Error(errorMessage);
      const riposte = new Retort(err, Classification.DOWNSTREAM, loggerMessage);

      expect(riposte._responseMessage).toEqual(errorMessage);
      expect(riposte._classification).toEqual(Classification.DOWNSTREAM);
      expect(riposte._error).toEqual(err);
      expect(riposte._loggingMessage).toEqual(loggerMessage);
      expect(riposte._statusCode).toEqual(undefined);
    });
  });

  describe('Initializer Methods', () => {
    it('withRespondError Initializer -- Message ONLY on RespondError instantiation', () => {
      const errorMessage = 'Test Error Message';
      const responseErr = new RespondError(errorMessage);
      const spy = spyOn(Retort, 'withRespondError').and.callThrough();

      const rip: Retort = Retort.withRespondError(responseErr);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(responseErr);
      // expect((rip as any)._responseMessage).toEqual(errorMessage); // Use this way if the properties are private
      expect(rip._responseMessage).toEqual(errorMessage);
      expect(rip._classification).toEqual(undefined);
      expect(rip._error).toEqual(responseErr);
      expect(rip._loggingMessage).toEqual(undefined);
      expect(rip._statusCode).toEqual(500);
    });

    it('withRespondError Initializer -- Message & Classification on RespondError instantiation', () => {
      const errorMessage = 'Test Error Message';
      const responseErr = new RespondError(errorMessage, Classification.DOWNSTREAM);
      const spy = spyOn(Retort, 'withRespondError').and.callThrough();

      const rip = Retort.withRespondError(responseErr);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(responseErr);
      // expect((rip as any)._responseMessage).toEqual(errorMessage); // Use this way if the properties are private
      expect(rip._responseMessage).toEqual(errorMessage);
      expect(rip._classification).toEqual(Classification.DOWNSTREAM);
      expect(rip._error).toEqual(responseErr);
      expect(rip._loggingMessage).toEqual(undefined);
      expect(rip._statusCode).toEqual(500);
    });

    it('withRespondError Initializer -- Message, Classification & Status Code on RespondError instantiation', () => {
      const errorMessage = 'Test Error Message';
      const responseErr = new RespondError(errorMessage, Classification.VALIDATION, 404);
      const spy = spyOn(Retort, 'withRespondError').and.callThrough();

      const rip = Retort.withRespondError(responseErr);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(responseErr);
      // expect((rip as any)._responseMessage).toEqual(errorMessage); // Use this way if the properties are private
      expect(rip._responseMessage).toEqual(errorMessage);
      expect(rip._classification).toEqual(Classification.VALIDATION);
      expect(rip._error).toEqual(responseErr);
      expect(rip._loggingMessage).toEqual(undefined);
      expect(rip._statusCode).toEqual(404);
    });

    it('withResponseMessage Initializer', () => {
      const errorMessage = 'Test Error Message';
      const spy = spyOn(Retort, 'withResponseMessage').and.callThrough();

      const rip = Retort.withResponseMessage(errorMessage);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(errorMessage);
      // expect((rip as any)._responseMessage).toEqual(errorMessage); // Use this way if the properties are private
      expect(rip._responseMessage).toEqual(errorMessage);
      expect(rip._classification).toEqual(undefined);
      expect(rip._error).toEqual(undefined);
      expect(rip._loggingMessage).toEqual(undefined);
      expect(rip._statusCode).toEqual(undefined);
    });
  });

  describe('Class Methods', () => {
    describe('badRequest', () => {
      describe('RespondError ONLY', () => {
        it('RespondError initialized with Message ONLY', () => {
          const errorMessage = 'Some RespondError Message';
          const returnObj = {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 400,
              message: errorMessage,
              level: 'ERROR'
            }),
          };

          const badRequestSpy = spyOn(Retort, 'badRequest').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const responseErr = new RespondError(errorMessage);

          const rip = Retort.badRequest(responseErr);

          expect(badRequestSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(errorMessage, undefined, 400));
          expect(rip).toEqual(returnObj);
        });

        it('RespondError initialized with Message & Classification', () => {
          const errorMessage = 'Some RespondError Message';
          const returnObj = {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 400,
              message: errorMessage,
              level: 'ERROR'
            }),
          };

          const badRequestSpy = spyOn(Retort, 'badRequest').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const responseErr = new RespondError(errorMessage, Classification.DATABASE);

          const rip = Retort.badRequest(responseErr);

          expect(badRequestSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(errorMessage, Classification.DATABASE, 400));
          expect(rip).toEqual(returnObj);
        });
      });

      describe('ResponseMessage', () => {
        it('ResponseMessage ONLY', () => {
          const respMsg = 'Some Error Response Message';
          const returnObj = {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 400,
              message: respMsg,
              level: 'ERROR'
            })
          };

          const badRequestSpy = spyOn(Retort, 'badRequest').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.badRequest(respMsg);

          expect(badRequestSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(respMsg, undefined, 400));
          expect(rip).toEqual(returnObj);
        });

        it('ResponseMessage & Classification', () => {
          const respMsg = 'Some Error Response Message';
          const returnObj = {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 400,
              message: respMsg,
              level: 'ERROR'
            })
          };

          const badRequestSpy = spyOn(Retort, 'badRequest').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.badRequest(respMsg, Classification.VALIDATION);

          expect(badRequestSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(respMsg, Classification.VALIDATION, 400));
          expect(rip).toEqual(returnObj);
        });

        it('ResponseMessage, Classification & Error', () => {
          const respMsg = 'Some Error Response Message';
          const returnObj = {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 400,
              message: respMsg,
              level: 'ERROR'
            })
          };
          const err = new Error('Some Error Message');

          const badRequestSpy = spyOn(Retort, 'badRequest').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.badRequest(respMsg, Classification.VALIDATION, err);

          expect(badRequestSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledWith(err, respMsg, 400, Classification.VALIDATION, undefined);
          expect(rip).toEqual(returnObj);
        });

        it('ResponseMessage, Classification, Error & loggerMessage', () => {
          const respMsg = 'Some Error Response Message';
          const logMsg = 'Some Logger Message';
          const returnObj = {
            statusCode: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 400,
              message: respMsg,
              level: 'ERROR'
            })
          };
          const err = new Error('Some Error Message');

          const badRequestSpy = spyOn(Retort, 'badRequest').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.badRequest(respMsg, Classification.VALIDATION, err, logMsg);

          expect(badRequestSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledWith(err, respMsg, 400, Classification.VALIDATION, logMsg);
          expect(rip).toEqual(returnObj);
        });
      });
    });

    describe('unauthorized', () => {
      describe('RespondError ONLY', () => {
        it('RespondError initialized with Message ONLY', () => {
          const errorMessage = 'Some RespondError Message';
          const returnObj = {
            statusCode: 401,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 401,
              message: errorMessage,
              level: 'ERROR'
            }),
          };

          const unauthorizedSpy = spyOn(Retort, 'unauthorized').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const responseErr = new RespondError(errorMessage);

          const rip = Retort.unauthorized(responseErr);

          expect(unauthorizedSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(errorMessage, undefined, 401));
          expect(rip).toEqual(returnObj);
        });

        it('RespondError initialized with Message & Classification', () => {
          const errorMessage = 'Some RespondError Message';
          const returnObj = {
            statusCode: 401,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 401,
              message: errorMessage,
              level: 'ERROR'
            }),
          };

          const unauthorizedSpy = spyOn(Retort, 'unauthorized').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const responseErr = new RespondError(errorMessage, Classification.DATABASE);

          const rip = Retort.unauthorized(responseErr);

          expect(unauthorizedSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(errorMessage, Classification.DATABASE, 401));
          expect(rip).toEqual(returnObj);
        });
      });

      describe('ResponseMessage', () => {
        it('ResponseMessage ONLY', () => {
          const respMsg = 'Some Error Response Message';
          const returnObj = {
            statusCode: 401,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 401,
              message: respMsg,
              level: 'ERROR'
            })
          };

          const unauthorizedSpy = spyOn(Retort, 'unauthorized').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.unauthorized(respMsg);

          expect(unauthorizedSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(respMsg, undefined, 401));
          expect(rip).toEqual(returnObj);
        });

        it('ResponseMessage & Classification', () => {
          const respMsg = 'Some Error Response Message';
          const returnObj = {
            statusCode: 401,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 401,
              message: respMsg,
              level: 'ERROR'
            })
          };

          const unauthorizedSpy = spyOn(Retort, 'unauthorized').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.unauthorized(respMsg, Classification.VALIDATION);

          expect(unauthorizedSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(respMsg, Classification.VALIDATION, 401));
          expect(rip).toEqual(returnObj);
        });

        it('ResponseMessage, Classification & Error', () => {
          const respMsg = 'Some Error Response Message';
          const returnObj = {
            statusCode: 401,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 401,
              message: respMsg,
              level: 'ERROR'
            })
          };
          const err = new Error('Some Error Message');

          const unauthorizedSpy = spyOn(Retort, 'unauthorized').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.unauthorized(respMsg, Classification.VALIDATION, err);

          expect(unauthorizedSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledWith(err, respMsg, 401, Classification.VALIDATION, undefined);
          expect(rip).toEqual(returnObj);
        });

        it('ResponseMessage, Classification, Error & loggerMessage', () => {
          const respMsg = 'Some Error Response Message';
          const logMsg = 'Some Logger Message';
          const returnObj = {
            statusCode: 401,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 401,
              message: respMsg,
              level: 'ERROR'
            })
          };
          const err = new Error('Some Error Message');

          const unauthorizedSpy = spyOn(Retort, 'unauthorized').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.unauthorized(respMsg, Classification.VALIDATION, err, logMsg);

          expect(unauthorizedSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledWith(err, respMsg, 401, Classification.VALIDATION, logMsg);
          expect(rip).toEqual(returnObj);
        });
      });
    });

    describe('forbidden', () => {
      describe('RespondError ONLY', () => {
        it('RespondError initialized with Message ONLY', () => {
          const errorMessage = 'Some RespondError Message';
          const returnObj = {
            statusCode: 403,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 403,
              message: errorMessage,
              level: 'ERROR'
            }),
          };

          const forbiddenSpy = spyOn(Retort, 'forbidden').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const responseErr = new RespondError(errorMessage);

          const rip = Retort.forbidden(responseErr);

          expect(forbiddenSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(errorMessage, undefined, 403));
          expect(rip).toEqual(returnObj);
        });

        it('RespondError initialized with Message & Classification', () => {
          const errorMessage = 'Some RespondError Message';
          const returnObj = {
            statusCode: 403,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 403,
              message: errorMessage,
              level: 'ERROR'
            }),
          };

          const forbiddenSpy = spyOn(Retort, 'forbidden').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const responseErr = new RespondError(errorMessage, Classification.DATABASE);

          const rip = Retort.forbidden(responseErr);

          expect(forbiddenSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(errorMessage, Classification.DATABASE, 403));
          expect(rip).toEqual(returnObj);
        });
      });

      describe('ResponseMessage', () => {
        it('ResponseMessage ONLY', () => {
          const respMsg = 'Some Error Response Message';
          const returnObj = {
            statusCode: 403,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 403,
              message: respMsg,
              level: 'ERROR'
            })
          };

          const forbiddenSpy = spyOn(Retort, 'forbidden').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.forbidden(respMsg);

          expect(forbiddenSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(respMsg, undefined, 403));
          expect(rip).toEqual(returnObj);
        });

        it('ResponseMessage & Classification', () => {
          const respMsg = 'Some Error Response Message';
          const returnObj = {
            statusCode: 403,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 403,
              message: respMsg,
              level: 'ERROR'
            })
          };

          const forbiddenSpy = spyOn(Retort, 'forbidden').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.forbidden(respMsg, Classification.VALIDATION);

          expect(forbiddenSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(respMsg, Classification.VALIDATION, 403));
          expect(rip).toEqual(returnObj);
        });

        it('ResponseMessage, Classification & Error', () => {
          const respMsg = 'Some Error Response Message';
          const returnObj = {
            statusCode: 403,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 403,
              message: respMsg,
              level: 'ERROR'
            })
          };
          const err = new Error('Some Error Message');

          const forbiddenSpy = spyOn(Retort, 'forbidden').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.forbidden(respMsg, Classification.VALIDATION, err);

          expect(forbiddenSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledWith(err, respMsg, 403, Classification.VALIDATION, undefined);
          expect(rip).toEqual(returnObj);
        });

        it('ResponseMessage, Classification, Error & loggerMessage', () => {
          const respMsg = 'Some Error Response Message';
          const logMsg = 'Some Logger Message';
          const returnObj = {
            statusCode: 403,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 403,
              message: respMsg,
              level: 'ERROR'
            })
          };
          const err = new Error('Some Error Message');

          const forbiddenSpy = spyOn(Retort, 'forbidden').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.forbidden(respMsg, Classification.VALIDATION, err, logMsg);

          expect(forbiddenSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledWith(err, respMsg, 403, Classification.VALIDATION, logMsg);
          expect(rip).toEqual(returnObj);
        });
      });
    });

    describe('notFound', () => {
      describe('RespondError ONLY', () => {
        it('RespondError initialized with Message ONLY', () => {
          const errorMessage = 'Some RespondError Message';
          const returnObj = {
            statusCode: 404,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 404,
              message: errorMessage,
              level: 'ERROR'
            }),
          };

          const notFoundSpy = spyOn(Retort, 'notFound').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const responseErr = new RespondError(errorMessage);

          const rip = Retort.notFound(responseErr);

          expect(notFoundSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(errorMessage, undefined, 404));
          expect(rip).toEqual(returnObj);
        });

        it('RespondError initialized with Message & Classification', () => {
          const errorMessage = 'Some RespondError Message';
          const returnObj = {
            statusCode: 404,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 404,
              message: errorMessage,
              level: 'ERROR'
            }),
          };

          const notFoundSpy = spyOn(Retort, 'notFound').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const responseErr = new RespondError(errorMessage, Classification.DATABASE);

          const rip = Retort.notFound(responseErr);

          expect(notFoundSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(errorMessage, Classification.DATABASE, 404));
          expect(rip).toEqual(returnObj);
        });
      });

      describe('ResponseMessage', () => {
        it('ResponseMessage ONLY', () => {
          const respMsg = 'Some Error Response Message';
          const returnObj = {
            statusCode: 404,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 404,
              message: respMsg,
              level: 'ERROR'
            })
          };

          const notFoundSpy = spyOn(Retort, 'notFound').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.notFound(respMsg);

          expect(notFoundSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(respMsg, undefined, 404));
          expect(rip).toEqual(returnObj);
        });

        it('ResponseMessage & Classification', () => {
          const respMsg = 'Some Error Response Message';
          const returnObj = {
            statusCode: 404,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 404,
              message: respMsg,
              level: 'ERROR'
            })
          };

          const notFoundSpy = spyOn(Retort, 'notFound').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.notFound(respMsg, Classification.VALIDATION);

          expect(notFoundSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(respMsg, Classification.VALIDATION, 404));
          expect(rip).toEqual(returnObj);
        });

        it('ResponseMessage, Classification & Error', () => {
          const respMsg = 'Some Error Response Message';
          const returnObj = {
            statusCode: 404,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 404,
              message: respMsg,
              level: 'ERROR'
            })
          };
          const err = new Error('Some Error Message');

          const notFoundSpy = spyOn(Retort, 'notFound').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.notFound(respMsg, Classification.VALIDATION, err);

          expect(notFoundSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledWith(err, respMsg, 404, Classification.VALIDATION, undefined);
          expect(rip).toEqual(returnObj);
        });

        it('ResponseMessage, Classification, Error & loggerMessage', () => {
          const respMsg = 'Some Error Response Message';
          const logMsg = 'Some Logger Message';
          const returnObj = {
            statusCode: 404,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 404,
              message: respMsg,
              level: 'ERROR'
            })
          };
          const err = new Error('Some Error Message');

          const notFoundSpy = spyOn(Retort, 'notFound').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.notFound(respMsg, Classification.VALIDATION, err, logMsg);

          expect(notFoundSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledWith(err, respMsg, 404, Classification.VALIDATION, logMsg);
          expect(rip).toEqual(returnObj);
        });
      });
    });

    describe('conflict', () => {
      describe('RespondError ONLY', () => {
        it('RespondError initialized with Message ONLY', () => {
          const errorMessage = 'Some RespondError Message';
          const returnObj = {
            statusCode: 409,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 409,
              message: errorMessage,
              level: 'ERROR'
            }),
          };

          const conflictSpy = spyOn(Retort, 'conflict').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const responseErr = new RespondError(errorMessage);

          const rip = Retort.conflict(responseErr);

          expect(conflictSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(errorMessage, undefined, 409));
          expect(rip).toEqual(returnObj);
        });

        it('RespondError initialized with Message & Classification', () => {
          const errorMessage = 'Some RespondError Message';
          const returnObj = {
            statusCode: 409,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 409,
              message: errorMessage,
              level: 'ERROR'
            }),
          };

          const conflictSpy = spyOn(Retort, 'conflict').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const responseErr = new RespondError(errorMessage, Classification.DATABASE);

          const rip = Retort.conflict(responseErr);

          expect(conflictSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(errorMessage, Classification.DATABASE, 409));
          expect(rip).toEqual(returnObj);
        });
      });

      describe('ResponseMessage', () => {
        it('ResponseMessage ONLY', () => {
          const respMsg = 'Some Error Response Message';
          const returnObj = {
            statusCode: 409,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 409,
              message: respMsg,
              level: 'ERROR'
            })
          };

          const conflictSpy = spyOn(Retort, 'conflict').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.conflict(respMsg);

          expect(conflictSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(respMsg, undefined, 409));
          expect(rip).toEqual(returnObj);
        });

        it('ResponseMessage & Classification', () => {
          const respMsg = 'Some Error Response Message';
          const returnObj = {
            statusCode: 409,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 409,
              message: respMsg,
              level: 'ERROR'
            })
          };

          const conflictSpy = spyOn(Retort, 'conflict').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.conflict(respMsg, Classification.VALIDATION);

          expect(conflictSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(respMsg, Classification.VALIDATION, 409));
          expect(rip).toEqual(returnObj);
        });

        it('ResponseMessage, Classification & Error', () => {
          const respMsg = 'Some Error Response Message';
          const returnObj = {
            statusCode: 409,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 409,
              message: respMsg,
              level: 'ERROR'
            })
          };
          const err = new Error('Some Error Message');

          const conflictSpy = spyOn(Retort, 'conflict').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.conflict(respMsg, Classification.VALIDATION, err);

          expect(conflictSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledWith(err, respMsg, 409, Classification.VALIDATION, undefined);
          expect(rip).toEqual(returnObj);
        });

        it('ResponseMessage, Classification, Error & loggerMessage', () => {
          const respMsg = 'Some Error Response Message';
          const logMsg = 'Some Logger Message';
          const returnObj = {
            statusCode: 409,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 409,
              message: respMsg,
              level: 'ERROR'
            })
          };
          const err = new Error('Some Error Message');

          const conflictSpy = spyOn(Retort, 'conflict').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.conflict(respMsg, Classification.VALIDATION, err, logMsg);

          expect(conflictSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledWith(err, respMsg, 409, Classification.VALIDATION, logMsg);
          expect(rip).toEqual(returnObj);
        });
      });
    });

    describe('internalServerError', () => {
      describe('RespondError ONLY', () => {
        it('RespondError initialized with Message ONLY', () => {
          const errorMessage = 'Some RespondError Message';
          const returnObj = {
            statusCode: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 500,
              message: errorMessage,
              level: 'ERROR'
            }),
          };

          const internalServerErrorSpy = spyOn(Retort, 'internalServerError').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const responseErr = new RespondError(errorMessage);

          const rip = Retort.internalServerError(responseErr);

          expect(internalServerErrorSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(errorMessage, undefined, 500));
          expect(rip).toEqual(returnObj);
        });

        it('RespondError initialized with Message & Classification', () => {
          const errorMessage = 'Some RespondError Message';
          const returnObj = {
            statusCode: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 500,
              message: errorMessage,
              level: 'ERROR'
            }),
          };

          const internalServerErrorSpy = spyOn(Retort, 'internalServerError').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const responseErr = new RespondError(errorMessage, Classification.DATABASE);

          const rip = Retort.internalServerError(responseErr);

          expect(internalServerErrorSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(errorMessage, Classification.DATABASE, 500));
          expect(rip).toEqual(returnObj);
        });
      });

      describe('ResponseMessage', () => {
        it('ResponseMessage ONLY', () => {
          const respMsg = 'Some Error Response Message';
          const returnObj = {
            statusCode: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 500,
              message: respMsg,
              level: 'ERROR'
            })
          };

          const internalServerErrorSpy = spyOn(Retort, 'internalServerError').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.internalServerError(respMsg);

          expect(internalServerErrorSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(respMsg, undefined, 500));
          expect(rip).toEqual(returnObj);
        });

        it('ResponseMessage & Classification', () => {
          const respMsg = 'Some Error Response Message';
          const returnObj = {
            statusCode: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 500,
              message: respMsg,
              level: 'ERROR'
            })
          };

          const internalServerErrorSpy = spyOn(Retort, 'internalServerError').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.internalServerError(respMsg, Classification.VALIDATION);

          expect(internalServerErrorSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expectStringifyEqual(errorSpy, new RespondError(respMsg, Classification.VALIDATION, 500));
          expect(rip).toEqual(returnObj);
        });

        it('ResponseMessage, Classification & Error', () => {
          const respMsg = 'Some Error Response Message';
          const returnObj = {
            statusCode: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 500,
              message: respMsg,
              level: 'ERROR'
            })
          };
          const err = new Error('Some Error Message');

          const internalServerErrorSpy = spyOn(Retort, 'internalServerError').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.internalServerError(respMsg, Classification.VALIDATION, err);

          expect(internalServerErrorSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledWith(err, respMsg, 500, Classification.VALIDATION, undefined);
          expect(rip).toEqual(returnObj);
        });

        it('ResponseMessage, Classification, Error & loggerMessage', () => {
          const respMsg = 'Some Error Response Message';
          const logMsg = 'Some Logger Message';
          const returnObj = {
            statusCode: 500,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
              code: 500,
              message: respMsg,
              level: 'ERROR'
            })
          };
          const err = new Error('Some Error Message');

          const internalServerErrorSpy = spyOn(Retort, 'internalServerError').and.callThrough();
          const errorSpy = spyOn(Retort, 'error').and.callThrough();

          const rip = Retort.internalServerError(respMsg, Classification.VALIDATION, err, logMsg);

          expect(internalServerErrorSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledTimes(1);
          expect(errorSpy).toBeCalledWith(err, respMsg, 500, Classification.VALIDATION, logMsg);
          expect(rip).toEqual(returnObj);
        });
      });
    });

    describe('ok', () => {
      it('EMPTY ARGS', () => {
        const returnObj = {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            riposte: {
              code: 200,
              message: '',
              level: 'SUCCESS'
            }
          }),
        };

        const okSpy = spyOn(Retort, 'ok').and.callThrough();

        const rip = Retort.ok();

        expect(okSpy).toBeCalledTimes(1);
        expect(rip).toEqual(returnObj);
      });
      it('responseMessage ONLY', () => {
        const respMessage = 'Some Response Message';
        const returnObj = {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            riposte: {
              code: 200,
              message: respMessage,
              level: 'SUCCESS'
            }
          }),
        };

        const okSpy = spyOn(Retort, 'ok').and.callThrough();

        const rip = Retort.ok(respMessage);

        expect(okSpy).toBeCalledTimes(1);
        expect(okSpy).toBeCalledWith(respMessage);
        expect(rip).toEqual(returnObj);
      });
      it('responseBody ONLY', () => {
        const respBod = {
          prop1: 'some prop value'
        };
        const returnObj = {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            prop1: respBod.prop1,
            riposte: {
              code: 200,
              message: '',
              level: 'SUCCESS'
            }
          }),
        };

        const okSpy = spyOn(Retort, 'ok').and.callThrough();

        const rip = Retort.ok(respBod);

        expect(okSpy).toBeCalledTimes(1);
        expect(okSpy).toBeCalledWith(respBod);
        expect(rip).toEqual(returnObj);
      });
      it('responseBody & responseMessage', () => {
        const respMessage = 'Some Response Message';
        const respBod = {
          prop1: 'some prop value'
        };
        const returnObj = {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            prop1: respBod.prop1,
            riposte: {
              code: 200,
              message: respMessage,
              level: 'SUCCESS'
            }
          }),
        };

        const okSpy = spyOn(Retort, 'ok').and.callThrough();

        const rip = Retort.ok(respBod, respMessage);

        expect(okSpy).toBeCalledTimes(1);
        expect(okSpy).toBeCalledWith(respBod, respMessage);
        expect(rip).toEqual(returnObj);
      });
    });

    describe('created', () => {
      it('EMPTY ARGS', () => {
        const returnObj = {
          statusCode: 201,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            riposte: {
              code: 201,
              message: '',
              level: 'SUCCESS'
            }
          }),
        };

        const createdSpy = spyOn(Retort, 'created').and.callThrough();

        const rip = Retort.created();

        expect(createdSpy).toBeCalledTimes(1);
        expect(rip).toEqual(returnObj);
      });
      it('responseMessage ONLY', () => {
        const respMessage = 'Some Response Message';
        const returnObj = {
          statusCode: 201,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            riposte: {
              code: 201,
              message: respMessage,
              level: 'SUCCESS'
            }
          }),
        };

        const createdSpy = spyOn(Retort, 'created').and.callThrough();

        const rip = Retort.created(respMessage);

        expect(createdSpy).toBeCalledTimes(1);
        expect(createdSpy).toBeCalledWith(respMessage);
        expect(rip).toEqual(returnObj);
      });
      it('responseBody ONLY', () => {
        const respBod = {
          prop1: 'some prop value'
        };
        const returnObj = {
          statusCode: 201,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            prop1: respBod.prop1,
            riposte: {
              code: 201,
              message: '',
              level: 'SUCCESS'
            }
          }),
        };

        const createdSpy = spyOn(Retort, 'created').and.callThrough();

        const rip = Retort.created(respBod);

        expect(createdSpy).toBeCalledTimes(1);
        expect(createdSpy).toBeCalledWith(respBod);
        expect(rip).toEqual(returnObj);
      });
      it('responseBody & responseMessage', () => {
        const respMessage = 'Some Response Message';
        const respBod = {
          prop1: 'some prop value'
        };
        const returnObj = {
          statusCode: 201,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            prop1: respBod.prop1,
            riposte: {
              code: 201,
              message: respMessage,
              level: 'SUCCESS'
            }
          }),
        };

        const createdSpy = spyOn(Retort, 'created').and.callThrough();

        const rip = Retort.created(respBod, respMessage);

        expect(createdSpy).toBeCalledTimes(1);
        expect(createdSpy).toBeCalledWith(respBod, respMessage);
        expect(rip).toEqual(returnObj);
      });
    });

    describe('noContent', () => {
      it('EMPTY ARGS', () => {
        const returnObj = {
          statusCode: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            riposte: {
              code: 204,
              message: '',
              level: 'SUCCESS'
            }
          }),
        };

        const noContentSpy = spyOn(Retort, 'noContent').and.callThrough();

        const rip = Retort.noContent();

        expect(noContentSpy).toBeCalledTimes(1);
        expect(rip).toEqual(returnObj);
      });
      it('responseMessage ONLY', () => {
        const respMessage = 'Some Response Message';
        const returnObj = {
          statusCode: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            riposte: {
              code: 204,
              message: respMessage,
              level: 'SUCCESS'
            }
          }),
        };

        const noContentSpy = spyOn(Retort, 'noContent').and.callThrough();

        const rip = Retort.noContent(respMessage);

        expect(noContentSpy).toBeCalledTimes(1);
        expect(noContentSpy).toBeCalledWith(respMessage);
        expect(rip).toEqual(returnObj);
      });
      it('responseBody ONLY', () => {
        const respBod = {
          prop1: 'some prop value'
        };
        const returnObj = {
          statusCode: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            prop1: respBod.prop1,
            riposte: {
              code: 204,
              message: '',
              level: 'SUCCESS'
            }
          }),
        };

        const noContentSpy = spyOn(Retort, 'noContent').and.callThrough();

        const rip = Retort.noContent(respBod);

        expect(noContentSpy).toBeCalledTimes(1);
        expect(noContentSpy).toBeCalledWith(respBod);
        expect(rip).toEqual(returnObj);
      });
      it('responseBody & responseMessage', () => {
        const respMessage = 'Some Response Message';
        const respBod = {
          prop1: 'some prop value'
        };
        const returnObj = {
          statusCode: 204,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            prop1: respBod.prop1,
            riposte: {
              code: 204,
              message: respMessage,
              level: 'SUCCESS'
            }
          }),
        };

        const noContentSpy = spyOn(Retort, 'noContent').and.callThrough();

        const rip = Retort.noContent(respBod, respMessage);

        expect(noContentSpy).toBeCalledTimes(1);
        expect(noContentSpy).toBeCalledWith(respBod, respMessage);
        expect(rip).toEqual(returnObj);
      });
    });

    describe('notModified', () => {
      it('EMPTY ARGS', () => {
        const returnObj = {
          statusCode: 304,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            riposte: {
              code: 304,
              message: '',
              level: 'SUCCESS'
            }
          }),
        };

        const notModifiedSpy = spyOn(Retort, 'notModified').and.callThrough();

        const rip = Retort.notModified();

        expect(notModifiedSpy).toBeCalledTimes(1);
        expect(rip).toEqual(returnObj);
      });
      it('responseMessage ONLY', () => {
        const respMessage = 'Some Response Message';
        const returnObj = {
          statusCode: 304,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            riposte: {
              code: 304,
              message: respMessage,
              level: 'SUCCESS'
            }
          }),
        };

        const notModifiedSpy = spyOn(Retort, 'notModified').and.callThrough();

        const rip = Retort.notModified(respMessage);

        expect(notModifiedSpy).toBeCalledTimes(1);
        expect(notModifiedSpy).toBeCalledWith(respMessage);
        expect(rip).toEqual(returnObj);
      });
      it('responseBody ONLY', () => {
        const respBod = {
          prop1: 'some prop value'
        };
        const returnObj = {
          statusCode: 304,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            prop1: respBod.prop1,
            riposte: {
              code: 304,
              message: '',
              level: 'SUCCESS'
            }
          }),
        };

        const notModifiedSpy = spyOn(Retort, 'notModified').and.callThrough();

        const rip = Retort.notModified(respBod);

        expect(notModifiedSpy).toBeCalledTimes(1);
        expect(notModifiedSpy).toBeCalledWith(respBod);
        expect(rip).toEqual(returnObj);
      });
      it('responseBody & responseMessage', () => {
        const respMessage = 'Some Response Message';
        const respBod = {
          prop1: 'some prop value'
        };
        const returnObj = {
          statusCode: 304,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
          },
          body: JSON.stringify({
            prop1: respBod.prop1,
            riposte: {
              code: 304,
              message: respMessage,
              level: 'SUCCESS'
            }
          }),
        };

        const notModifiedSpy = spyOn(Retort, 'notModified').and.callThrough();

        const rip = Retort.notModified(respBod, respMessage);

        expect(notModifiedSpy).toBeCalledTimes(1);
        expect(notModifiedSpy).toBeCalledWith(respBod, respMessage);
        expect(rip).toEqual(returnObj);
      });
    });
  });

  describe('Retort', () => {
    it('With Response Body ONLY', () => {
      const respBod = {
        prop1: 'some prop value',
        message: 'some response message',
        code: 226
      };

      const returnObj = {
        statusCode: 226,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          prop1: 'some prop value',
          message: 'some response message',
          code: 226,
          riposte: {
            code: 226,
            message: 'some response message',
            level: 'SUCCESS'
          }
        })
      };

      const sendSpy = spyOn(Retort, 'send').and.callThrough();
      const rip = Retort.send(respBod);

      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(rip).toEqual(returnObj);
    });
    it('With Response Body & HTTP Code', () => {
      const respBod = {
        prop1: 'some prop value',
        code: 418
      };

      const returnObj = {
        statusCode: 418,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          prop1: 'some prop value',
          code: 418,
          riposte: {
            code: 418,
            message: '',
            level: 'ERROR'
          }
        })
      };

      const sendSpy = spyOn(Retort, 'send').and.callThrough();
      const rip = Retort.send(respBod, 418);

      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(rip).toEqual(returnObj);
    });
    it('With Response Body, HTTP Code & Response Level', () => {
      const respBod = {
        prop1: 'some prop value',
        code: 418
      };

      const returnObj = {
        statusCode: 418,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          prop1: 'some prop value',
          code: 418,
          riposte: {
            code: 418,
            message: '',
            level: 'ERROR'
          }
        })
      };

      const sendSpy = spyOn(Retort, 'send').and.callThrough();
      const rip = Retort.send(respBod, 418, ResponseLevel.ERROR);

      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(rip).toEqual(returnObj);
    });

    it('With Response Message & HTTP Code', () => {
      const respMessage = 'some response message';
      const returnObj = {
        statusCode: 226,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: 'some response message',
          riposte: {
            code: 226,
            message: 'some response message',
            level: 'SUCCESS'
          }
        })
      };

      const sendSpy = spyOn(Retort, 'send').and.callThrough();
      const rip = Retort.send(respMessage, 226);

      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(rip).toEqual(returnObj);
    });
    it('With Response Message, HTTP Code & Response Level', () => {
      const respMessage = 'some response message';
      const returnObj = {
        statusCode: 302,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
          message: 'some response message',
          riposte: {
            code: 302,
            message: 'some response message',
            level: 'INFO'
          }
        })
      };

      const sendSpy = spyOn(Retort, 'send').and.callThrough();
      const rip = Retort.send(respMessage, 302, ResponseLevel.INFO);

      expect(sendSpy).toHaveBeenCalledTimes(1);
      expect(rip).toEqual(returnObj);
    });
  });
});