// Copyright IBM Corp. 2013. All Rights Reserved.
// Node module: loopback-connector-jsonrpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

var jayson = require('jayson');

// create a server
var server = jayson.server({
  add: function(a, b, callback) {
    callback(null, a + b);
  },
  subtract: function(a, b, callback) {
    callback(null, a - b);
  },
});

var loopback = require('loopback');

var ds = loopback.createDataSource({
  connector: require('../index'),
  debug: false,
  url: 'http://localhost:3000',
  operations: ['add', 'subtract']});

var model = ds.createModel('dummy');

var app = loopback();

app.use(loopback.rest());
app.use(server.middleware(server));

// Bind a http interface to the server and let it listen to localhost:3000
var s = app.listen(3000, function() {
  model.add(1, 2, function(err, data) {
    console.log(err, data);
    s.close();
  });
});
