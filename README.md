# Loopback JSONRPC Connector

The Loopback JSONRPC Connector allows you to call JSONRPC services from loopback models. It's built with
https://github.com/tedeh/jayson.

Sample to use the connector:

    var ds = loopback.createDataSource({
        connector: require("loopback-connector-jsonrpc"),
        debug: false,
        baseURL: 'http://localhost:3000',
        operations: ['add', 'subtract']});

    var model = ds.createModel('dummy');

    model.add(1, 2, function(err, data) {
        console.log(err, data);
    });

Options to configure the connector:

* baseURL: Base URL to the jsonrpc server
* oerations: An array of operation names

Other properties will be passed to jayson. The other flavor to configure the baseURL is:

    {
        host: 'localhost',
        port: 3000
    }

