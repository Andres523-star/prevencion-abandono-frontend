export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export const logger = {
  info: (mensaje: string, meta?: unknown) => {
    console.info(`[INFO - UCC] ${mensaje}`, meta ?? '');
  },
  warn: (mensaje: string, meta?: unknown) => {
    console.warn(`[WARN - UCC] ${mensaje}`, meta ?? '');
  },
  error: (mensaje: string, error?: unknown) => {
    console.error(`[ERROR - UCC] ${mensaje}`, error ?? '');
  }
};
