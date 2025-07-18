import { NextResponse } from 'next/server';

interface ErrorResponse {
  error: string;
  details?: any;
}

interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

export function apiError(
  message: string, 
  status: number = 500, 
  details?: any
): NextResponse<ErrorResponse> {
  const body: ErrorResponse = { error: message };
  if (details) {
    body.details = details;
  }
  return NextResponse.json(body, { status });
}

export function apiSuccess<T = any>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<SuccessResponse<T>> {
  const body: SuccessResponse<T> = { success: true };
  if (data !== undefined) {
    body.data = data;
  }
  if (message) {
    body.message = message;
  }
  return NextResponse.json(body, { status });
}

// Common error responses
export const commonErrors = {
  badRequest: (message = 'Bad request', details?: any) => 
    apiError(message, 400, details),
  
  unauthorized: (message = 'Unauthorized') => 
    apiError(message, 401),
  
  notFound: (message = 'Resource not found') => 
    apiError(message, 404),
  
  rateLimit: (message = 'Rate limit exceeded') => 
    apiError(message, 429),
  
  serverError: (message = 'Internal server error', details?: any) => 
    apiError(message, 500, details),
  
  validationError: (message: string, details?: any) =>
    apiError(message, 400, details)
};