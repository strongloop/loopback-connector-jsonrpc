// Copyright IBM Corp. 2013,2018. All Rights Reserved.
// Node module: loopback-connector-jsonrpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const jayson = require('jayson');

// create a server
const server = jayson.server({
  add: function(args, callback) {
    callback(null, args[0] + args[1]);
  },
  subtract: function(args, callback) {
    callback(null, args[0] - args[1]);
  },
});

const loopback = require('loopback');

const ds = loopback.createDataSource({
  connector: require('../index'),
  debug: false,
  url: 'http://localhost:3000',
  operations: ['add', 'subtract']});

const model = ds.createModel('dummy');

const app = loopback();

app.use(loopback.rest());
app.use(server.middleware(server));

// Bind a http interface to the server and let it listen to localhost:3000
const s = app.listen(3000, function() {
  model.add(1, 2, function(err, data) {
    console.log(err, data);
    s.close();
  });
});
