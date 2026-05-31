import * as fs from 'fs';
import * as path from 'path';

class Logger {
  private logDir: string;
  private logFile: string;

  constructor() {
    this.logDir = path.join(__dirname, '../reports/logs');
    this.ensureLogDirectory();
    this.logFile = path.join(this.logDir, `test-${new Date().getTime()}.log`);
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  private writeLog(level: string, message: string, data?: any): void {
    const timestamp = this.getCurrentTimestamp();
    let logMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      logMessage += `\n${JSON.stringify(data, null, 2)}`;
    }

    console.log(logMessage);
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  info(message: string, data?: any): void {
    this.writeLog('INFO', message, data);
  }

  error(message: string, data?: any): void {
    this.writeLog('ERROR', message, data);
  }

  warn(message: string, data?: any): void {
    this.writeLog('WARN', message, data);
  }

  debug(message: string, data?: any): void {
    this.writeLog('DEBUG', message, data);
  }

  test(testName: string, status: string, details?: any): void {
    this.writeLog('TEST', `${testName} - ${status}`, details);
  }
}

export const logger = new Logger();
