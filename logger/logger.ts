
import * as log from 'loglevel';
log.setLevel(process.env.LOG_LEVEL as any);

/**
 * @class
 * @desc logger object for added logging info
 */
export class Logger {

  private className: string;
  
  constructor(className?: string) {
    this.className = className || '';
  }

  public debug(...args) {
    log.debug(`${this.className}`, ...args);
  }
  
  public error(...args) {
    log.error(`${this.className}`, ...args);
  }

  public info(...args) {
    log.info(`${this.className}`, ...args);
  }
  
  public trace(...args) {
    log.trace(`${this.className}`, ...args);
  }
  
  public warn(...args) {
    log.warn(`${this.className}`, ...args);
  }
  
}

