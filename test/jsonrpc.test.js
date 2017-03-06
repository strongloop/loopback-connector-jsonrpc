// Copyright IBM Corp. 2013. All Rights Reserved.
// Node module: loopback-connector-jsonrpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var loopback = require('loopback');
var jayson = require('jayson');
var assert = require('assert');

describe('JSON-RPC connector', function() {
  var app, s, model;
  before(function(done) {
        // create a server
    var server = jayson.server({
      add: function(a, b, callback) {
        callback(null, a + b);
      },
      subtract: function(a, b, callback) {
        callback(null, a - b);
      },
      divide: function(a, b, callback) {
        if (b === 0) {
          callback('Cannot divide by 0');
        } else {
          callback(null, a / b);
        }
      },
    });


    var ds = loopback.createDataSource({
      connector: require('../index'),
      debug: false,
      url: 'http://localhost:3000',
      operations: ['add', 'subtract', 'multiply', 'divide'],
    });

    model = ds.createModel('dummy');

    app = loopback();

    app.use(loopback.bodyParser());
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
