
import { Client } from 'pg';
import { Logger } from '../logger/logger';

export default class BaseDao {

  client: Client;
  connected: boolean = false;
  log: Logger;
  transactionOpen: boolean = false;

  construtor(className: string, client?: Client) {
    this.log = new Logger(className);
    this.client = client || new Client();
  }

  public begin = async () => {
    if (!this.connected) {
      try {
        const start = Date.now();
        await this.client.connect();
        this.connected = true;
        this.log.trace(`opened database connection in ${Date.now() - start} milliseconds`);
      } catch (error) {
        this.log.error(`Dao failed to connect to database`, error);
        this.connected = false;
      }
    }
    return this.connected;
  }

  public close = async () => {
    if (this.transactionOpen) 
      throw new Error(`Transaction currently open. Commit changes before closing connection`);
    try {
      return await this.client.close();
    } catch (error) {
      this.log.error(`Failed to close database connection`);
      throw error;
    }
  }

  public query = async (paramaterizedQuery: string, params: string[]) => {
    let result: any = {};
    await this.begin();
    try {
      const start = Date.now();
      result = await this.client.query(paramaterizedQuery, params);
      this.log.trace(`Query Successful: ${result.rowCount} rows returned in ${Date.now() - start}`);
    } catch (error) {
      this.log.error(`Querying database failed`, error.stack);
    } finally {
      if (!this.transactionOpen) this.close();
    }
  }

}
