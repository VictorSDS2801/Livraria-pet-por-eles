import { randomUUID } from 'crypto';
import { IncomingHttpHeaders } from 'http';

export const CORRELATION_ID_HEADER = 'x-correlation-id';
export const REQUEST_ID_HEADER = 'x-request-id';

type ResolveCorrelationIdOptions = {
  idFactory?: () => string;
};

function normalizeHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return normalizeHeaderValue(value[0]);
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function extractIncomingCorrelationId(headers: IncomingHttpHeaders): string | undefined {
  return (
    normalizeHeaderValue(headers[CORRELATION_ID_HEADER]) ??
    normalizeHeaderValue(headers[REQUEST_ID_HEADER])
  );
}

/**
 * Resolve o correlation id de uma requisição: usa o header recebido do
 * cliente/gateway se existir, senão gera um novo UUID. (Sem OpenTelemetry
 * aqui — se um trace id for necessário no futuro, basta plugar de volta.)
 */
export function resolveCorrelationId(
  headers: IncomingHttpHeaders,
  options: ResolveCorrelationIdOptions = {},
): string {
  const incomingCorrelationId = extractIncomingCorrelationId(headers);

  if (incomingCorrelationId) {
    return incomingCorrelationId;
  }

  const createId = options.idFactory ?? randomUUID;
  return createId();
}

export function setCorrelationIdHeader(
  response: {
    setHeader: (name: string, value: number | string | readonly string[]) => unknown;
  },
  correlationId: string,
): void {
  response.setHeader(CORRELATION_ID_HEADER, correlationId);
}

export function getRequestCorrelationId(request: { id?: unknown }): string | undefined {
  if (typeof request.id !== 'string') {
    return undefined;
  }

  const trimmed = request.id.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
