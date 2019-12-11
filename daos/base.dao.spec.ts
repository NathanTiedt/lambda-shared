
process.env.LOG_LEVEL = 'silent';

import { expect } from 'chai';
import 'mocha';
import { TestServices } from '../testing';

import { BaseDao } from './base.dao';

describe('Base Dao Tests', () => {

  let dao: BaseDao;
  let testServices: TestServices;

  beforeEach(() => {
    testServices = new TestServices();
    dao = new BaseDao('TestBaseDao', testServices.createPgClient());
  });
  
  describe('functional tests', () => {
    it('should successfully query database', async () => {
      const result = await dao.query('SELECT *');
      expect(result).to.be.an('array');
      expect(result.length).to.equal(1);
    });

    it('should successfully run transaction', async () => {
      let result: any = await dao.begin();
      expect(result).to.equal(true);
      result = await dao.query('SELECT *');
      expect(result).to.be.an('array');
      expect(result.length).to.equal(1);
      result = await dao.commit();
      expect(result).to.equal(true);
    });
  });

  describe('.begin() tests', () => {
    it('should start transaction', async () => {
      let result = await dao.begin();
      expect(result).to.equal(true);
      expect(dao.connected).to.be.true;
      expect(dao.transactionStarted).to.be.true;
    });

    it('should handle already started transaction', async() => {
      dao.transactionStarted = true;
      dao.connected = true;
      let result = await dao.begin();
      expect(result).to.equal(true);
      expect(dao.connected).to.be.true;
      expect(dao.transactionStarted).to.be.true;
    });

    it('should throw error on query failure', async () => {
      dao = new BaseDao('TestBaseDao', testServices.createPgClient(() => {throw new Error('Simulated');}));
      try {
        let result = await dao.begin();
      } catch (error) {
        expect(error.message).to.equal('Error: Simulated');
        expect(dao.transactionStarted).to.be.false;
      }
    });
  });
  
  describe('.close() tests', () => {
    it('should return true with no connection to close', async () => {
      let result = await dao.close();
      expect(result).to.equal(true);
    });

    it('should close connection successfully', async () => {
      dao.connected = true;
      let result = await dao.close();
      expect(result).to.equal(true);
      expect(dao.transactionStarted).to.be.false;
      expect(dao.connected).to.be.false;
    });

    it('should close connection with rollback', async () => {
      dao.connected = true;
      dao.transactionStarted = true;
      let result = await dao.close();
      expect(result).to.equal(true);
      expect(dao.transactionStarted).to.be.false;
      expect(dao.connected).to.be.false;
    });
  });

  describe('.commit() tests', () => {

  });

  describe('.connect() tests', () => {

  });

  describe('.query() tests', () => {

  });

  describe('.rollback() tests', () => {

  });

});

