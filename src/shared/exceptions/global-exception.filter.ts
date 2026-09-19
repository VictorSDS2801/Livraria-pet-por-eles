import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../../domain/exceptions/domain.exception';
import { getRequestCorrelationId } from '../observability/correlation-id';

type PinoLikeLogger = {
  error: (payload: unknown, message?: string) => void;
};

type RequestWithUnknownLogger = Request & {
  id?: unknown;
  log?: unknown;
};

type HttpErrorDetails = {
  status: number;
  message: string | string[];
  errorType: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeMessage(value: unknown, fallbackMessage: string): string | string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
  }

  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  return fallbackMessage;
}

function parseHttpExceptionDetails(exception: HttpException): HttpErrorDetails {
  const fallbackMessage = exception.message;
  const responseBody = exception.getResponse();

  if (typeof responseBody === 'string') {
    return {
      status: exception.getStatus(),
      message: responseBody,
      errorType: 'HttpException',
    };
  }

  if (isRecord(responseBody)) {
    return {
      status: exception.getStatus(),
      message: normalizeMessage(responseBody.message, fallbackMessage),
      errorType: typeof responseBody.error === 'string' ? responseBody.error : 'HttpException',
    };
  }

  return {
    status: exception.getStatus(),
    message: fallbackMessage,
    errorType: 'HttpException',
  };
}

function extractRequestLogger(request: RequestWithUnknownLogger): PinoLikeLogger | undefined {
  if (!isRecord(request.log)) {
    return undefined;
  }

  const maybeErrorFn = request.log.error;

  if (typeof maybeErrorFn !== 'function') {
    return undefined;
  }

  return {
    error: maybeErrorFn as PinoLikeLogger['error'],
  };
}

function logRequestException(
  logger: PinoLikeLogger | undefined,
  payload: {
    err: unknown;
    correlationId: string | undefined;
    method: string;
    path: string;
  },
): void {
  if (!logger) {
    return;
  }

  try {
    logger.error(payload, 'Unhandled request exception');
  } catch {
    // Intencional: não devemos interromper a resposta se o logger falhar
  }
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithUnknownLogger>();
    const correlationId = getRequestCorrelationId(request);
    const logger = extractRequestLogger(request);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Erro interno no servidor';
    let errorType = 'InternalServerError';

    // Se for um erro gerado pelo NestJS (ex: Validação de DTOs, Not Found)
    if (exception instanceof HttpException) {
      const details = parseHttpExceptionDetails(exception);
      status = details.status;
      message = details.message;
      errorType = details.errorType;
    }
    // Se for um erro das nossas Regras de Negócio (DDD)
    else if (exception instanceof DomainException) {
      status = HttpStatus.UNPROCESSABLE_ENTITY; // 422 - Falha de regra de negócio
      message = exception.message;
      errorType = exception.code;
    }
    // Outros erros não tratados (Bugs no código, falha de BD, etc)
    else if (exception instanceof Error) {
      message = exception.message; // Em produção, considere ocultar isto do cliente!
    }

    logRequestException(logger, {
      err: exception,
      correlationId,
      method: request.method,
      path: request.url,
    });

    // Resposta formatada e padronizada para o Front-end
    response.status(status).json({
      statusCode: status,
      error: errorType,
      message: Array.isArray(message) ? message : [message],
      correlationId,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
