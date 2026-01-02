export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
  method: string;
  details?: Record<string, any>;
  stack?: string;
}

export interface ValidationErrorDetail {
  field: string;
  constraints: string[];
}
