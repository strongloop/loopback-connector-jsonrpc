// Copyright IBM Corp. 2013,2018. All Rights Reserved.
// Node module: loopback-connector-jsonrpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const assert = require('assert');
const bodyParser = require('body-parser');
const jayson = require('jayson');
const loopback = require('loopback');

describe('JSON-RPC connector', function() {
  let app, s, model;
  before(function(done) {
    // create a server
    const server = jayson.server({
      add: function(args, callback) {
        callback(null, args[0] + args[1]);
      },
      subtract: function(args, callback) {
        callback(null, args[0] - args[1]);
      },
      divide: function(args, callback) {
        if (args[1] === 0) {
          callback('Cannot divide by 0');
        } else {
          callback(null, args[0] / args[1]);
        }
      },
    });

    const ds = loopback.createDataSource({
      connector: require('../index'),
      debug: false,
      url: 'http://localhost:3000',
      operations: ['add', 'subtract', 'multiply', 'divide'],
    });

    model = ds.createModel('dummy');

    app = loopback();

    app.use(bodyParser.json());
    app.use(server.middleware(server));
    s = app.listen(3000, done);
  });

  it('invokes add json-rpc services', function(done) {
    model.add(1, 2, function(err, data) {
      assert.equal(data, 3);
      done();
    });
  });

  it('invokes subtract json-rpc services', function(done) {
    model.subtract(1, 2, function(err, data) {
      assert.equal(data, -1);
      done();
    });
  });

  it('invokes divide json-rpc services', function(done) {
    model.divide(4, 2, function(err, data) {
      assert.equal(data, 2);
      done();
    });
  });

  it('reports unknown method', function(done) {
    model.multiply(1, 5, function(err, data) {
      assert.equal(err.code, -32601);
      assert.equal(err.message, 'Method not found');
      done();
    });
  });

  it('reports error response', function(done) {
    model.divide(1, 0, function(err, data) {
      assert(err.code, -32603);
      done();
    });
  });

  after(function(done) {
    s.close(done);
  });
});
