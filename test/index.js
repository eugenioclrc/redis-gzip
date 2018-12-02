/* global describe, it, before */
/* eslint-disable import/no-extraneous-dependencies, no-underscore-dangle */
/* eslint-disable comma-dangle, no-unused-expressions */

const chai = require('chai');

chai.config.includeStack = true;
chai.config.showDiff = true;

const { expect } = chai;

const RedisGZ = require('../index')('localhost', 6379);


// SAMPLES
const sampleJson = {
  key1: 'value1',
  keyEmpty: '',
};
const existedKey = `${(new Date()).getTime().toString()}-existed`;

describe('compress and uncompress - ', () => {
  before(() => RedisGZ.simpleset(existedKey, 'bar', 1000 * 60 * 60 * 24));

  it('redis expire value in seconds', async () => {
    const key = 'expireKey';
    await RedisGZ.set(key, 'bar', 10 /* 10 seconds? */);
    return new Promise((resolve) => {
      setTimeout(() => {
        RedisGZ.get(key).then((value) => {
          expect(value).to.be.equal('bar');
          resolve();
        });
      }, 1000 /* 1 seconds */);
    });
  });

  it('redis expire value in seconds expire', () => {
    const key = 'expireKeyExpired';
    return RedisGZ.set(key, 'foo', 1 /* 10 seconds? */).then(() => new Promise((resolve, reject) => {
      setTimeout(() => {
        RedisGZ.simpleget(key).then((value) => {
          expect(value).to.be.null;
          resolve();
        }).catch(reject);
      }, 2000 /* 1 seconds */);
    }));
  });

  it('exists key', () => RedisGZ.exists(existedKey).then(exists => expect(exists).to.be.true));

  it('Not exists key', () => RedisGZ.exists((new Date()).getTime().toString()).then(exists => expect(exists).to.be.false));

  it('simpleset && simpleget', async () => {
    const key = (new Date()).getTime().toString();
    await RedisGZ.simpleset(key, JSON.stringify(sampleJson));
    const value = await RedisGZ.simpleget(key);
    const obj = JSON.parse(value.toString());
    expect(obj).to.be.an('object');
    expect(obj).to.have.keys('key1', 'keyEmpty');
    expect(obj.key1).to.be.a('string').and.equal('value1');
    expect(obj.keyEmpty).to.be.a('string').and.equal('');
  });
});
