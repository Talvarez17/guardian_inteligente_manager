import { HttpErrorResponse } from '@angular/common/http';

const DEFAULT_FALLBACK = 'Ocurrió un error inesperado. Intenta de nuevo.';

export function resolveErrorMessage(error: unknown, fallback: string = DEFAULT_FALLBACK): string {
  if (error instanceof HttpErrorResponse) {
    const message = error.error?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  return fallback;
}
