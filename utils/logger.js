const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFilePath = path.join(logDir, 'app.log');

const writeLog = (level, event, details = {}) => {
  const timestamp = new Date().toISOString();
  const sanitized = { ...details };
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.authorization;

  const logEntry = `[${timestamp}] [${level.toUpperCase()}] [${event}] ${JSON.stringify(sanitized)}\n`;
  fs.appendFile(logFilePath, logEntry, () => {});
};

module.exports = {
  info: (event, details) => writeLog('info', event, details),
  warn: (event, details) => writeLog('warn', event, details),
  error: (event, details) => writeLog('error', event, details)
};
