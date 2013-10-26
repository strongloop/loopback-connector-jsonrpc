var loopback = require("loopback");
var jayson = require('jayson');
var assert = require('assert');

describe('JSON-RPC connector', function () {
    it('invokes json-rpc services', function () {

        // create a server
        var server = jayson.server({
            add: function (a, b, callback) {
                callback(null, a + b);
            },
            subtract: function (a, b, callback) {
                callback(null, a - b);
            }
        });


        var ds = loopback.createDataSource({
            connector: require("../index"),
            debug: false,
            baseURL: 'http://localhost:3000',
            operations: ['add', 'subtract']});

        var model = ds.createModel('dummy');

        var app = loopback();

        app.use(loopback.rest());
        app.use(server.middleware(server));

        // Bind a http interface to the server and let it listen to localhost:3000
        var s = app.listen(3000, function () {

            model.add(1, 2, function (err, data) {
                console.log(err, data);
                s.close();
                assert.equal(data, 3);
                done();
            });

        });
    });
});