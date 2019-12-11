
import { Context } from 'aws-lambda';
import { Logger } from '../logger/logger';

export abstract class BaseController {

  log: Logger;
  
  constructor (className: string) {
    this.log = new Logger(className);
  }

  public abstract handleEvent(event: any, context: Context): any;

}
