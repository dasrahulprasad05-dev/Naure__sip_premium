/* ==========================================================================
   NatureSip Structured Logging System
   ========================================================================== */
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, '..', 'logs');

// Define custom levels if needed, or stick to standard RFC5424 levels.
// We'll use standard levels and categorize by metadata or custom formatter.
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  audit: 4, // Custom level for administrative actions/payments
  debug: 5
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  audit: 'cyan',
  debug: 'white'
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level.toUpperCase()}]: ${info.message}${info.metadata && Object.keys(info.metadata).length ? ' | ' + JSON.stringify(info.metadata) : ''}`
  )
);

const auditFilter = winston.format((info) => {
  return (info.isAudit || info.level === 'audit') ? info : false;
})();

const transports = [
  // Console log
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => `[${info.timestamp}] [${info.level}]: ${info.message}`
      )
    )
  }),
  // combined.log contains all logs
  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    level: 'debug'
  }),
  // errors.log contains error-only logs
  new winston.transports.File({
    filename: path.join(logDir, 'errors.log'),
    level: 'error'
  }),
  // audit.log contains audit-specific logs
  new winston.transports.File({
    filename: path.join(logDir, 'audit.log'),
    level: 'info',
    format: winston.format.combine(
      auditFilter
    )
  })
];

export const logger = winston.createLogger({
  level: 'debug',
  levels,
  format,
  transports
});

/**
 * Log helper for admin/payment operations audit trailing.
 */
export const logAudit = (action, entity, userId, details = {}, ip = '') => {
  logger.info(`Audit Action: ${action} on ${entity} by User: ${userId || 'SYSTEM'}`, {
    isAudit: true,
    metadata: {
      action,
      entity,
      userId,
      details,
      ip
    }
  });
};
