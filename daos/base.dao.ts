
import { Client } from 'pg';
import { Logger } from '../logger/logger';

/**
 * base class for daos
 * provides helper functions for transactions and queries
 * requires environment variables for the datbase config
 * following env variables: PGUSER, PGHOST, PGPASSWORD, PGDATABASE, PGPORT
 * @class
 */
export class BaseDao {

  client: Client;
  connected: boolean = false;
  log: Logger;
  transactionStarted: boolean = false;

  /** @constructor **/
  constructor(className: string, client?: Client) {
    this.log = new Logger(className);
    this.client = client || new Client();
  }

  /**
   * begins a transaction
   */
  public begin = async () => {
    if (this.transactionStarted) {
      this.log.warn(`Transaction already started`);
      return true;
    }
    try {
      this.log.debug(`Begining Transaction`);
      this.transactionStarted = true;
      await this.query(`BEGIN`);
      return true;
    } catch (error) {
      this.log.error(`Transaction failed to begin`, error);
      this.transactionStarted = false;
      throw error;
    }
  }

  /**
   * closes a database connection
   */
  public close = async () => {
    if (!this.connected) {
      // TODO: needed? or should we error?
      this.log.warn(`Connection already closed`);
      return true;
    }
    if (this.transactionStarted) {
      this.log.warn(`Transaction currently open. Rolling back changes before closing connection`);
      return await this.rollback();
    }
    try {
      this.log.debug(`Closing database connection`);
      await this.client.close();
      this.connected = false;
      return true;
    } catch (error) {
      this.log.error(`Failed to close database connection`, error);
      throw error;
    }
  }

  /**
   * commits a transaction
   */
  public commit = async () => {
    if (!this.transactionStarted) 
      throw new Error(`No transaction in progress`);
    try {
      this.log.debug(`Commiting transaction`);
      this.transactionStarted = false; // set to false so the query function closes the connection
      await this.query(`COMMIT`);
      return true;
    } catch (error) {
      this.log.error(`Transaction failed to commit`, error);
      return false;
    }
  }

  /**
   * connects to a database
   */
  public connect = async () => {
    if (!this.connected) {
      try {
        const start = Date.now();
        await this.client.connect();
        this.connected = true;
        this.log.debug(`opened database connection in ${Date.now() - start} milliseconds`);
      } catch (error) {
        this.log.error(`Dao failed to connect to database`, error);
        this.connected = false;
      }
    }
    return this.connected;
  }

  /**
   * queries the database
   */
  public query = async (query: string, params?: string[]) => {
    try {
      const start = Date.now();
      await this.connect();
      const result = await this.client.query(query, params);
      this.log.debug(`Query Successful: ${result.rowCount} rows returned in ${Date.now() - start}`);
      return result.rows;
    } catch (error) {
      this.log.error(`Querying database failed`, error);
      throw new Error(error);
    } finally {
      if (!this.transactionStarted) this.close();
    }
  }

  /**
   * rollsback a transaction
   */
  public rollback = async () => {
    if (!this.transactionStarted) 
      throw new Error(`No transaction in progress`);
    try {
      this.log.debug(`Rolling back transaction`);
      this.transactionStarted = false; // set to false so the query function closes the connection
      await this.query(`ROLLBACK`);
      return true;
    } catch (error) {
      this.log.error(`Transaction failed to rollback`, error);
      return false;
    }
  }

}
