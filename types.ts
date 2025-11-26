export enum MigrationType {
  SCHEMA = 'SCHEMA',
  FUNCTION = 'FUNCTION',
  QUERY = 'QUERY',
  FULL_PACKAGE = 'FULL_PACKAGE'
}

export interface ConversionResult {
  postgresCode: string;
  notes: string[];
  error?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: MigrationType;
  snippet: string;
}