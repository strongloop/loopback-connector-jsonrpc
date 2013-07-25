# Loopback JSONRPC Connector

The Loopback JSONRPC Connector allows you to call JSONRPC services from loopback models. It's built with
https://github.com/tedeh/jayson.

Options to configure the connector:

    var ds = loopback.createDataSource({
        connector: require("loopback-connector-jsonrpc"),
        debug: false,
        baseURL: 'http://localhost:3000',
        operations: ['add', 'subtract']});

    var model = ds.createModel('dummy');

    model.add(1, 2, function(err, data) {
        console.log(err, data);
    });



