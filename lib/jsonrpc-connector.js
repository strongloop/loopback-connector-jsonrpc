// Copyright IBM Corp. 2013. All Rights Reserved.
// Node module: loopback-connector-jsonrpc
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var jayson = require('jayson');
var url = require('url');
var g = require('strong-globalize')();

/**
 * Export the initialize method to loopback-datasource-juggler
 * @param dataSource
 * @param callback
 */
exports.initialize = function initializeDataSource(dataSource, callback) {
    var settings = dataSource.settings || {};

    var connector = new JsonRpcConnector(settings);
    connector.getDataAccessObject();

    dataSource.connector = connector;
    dataSource.connector.dataSource = dataSource;

    for (var f in connector.DataAccessObject) {
        dataSource[f] = connector.DataAccessObject[f];
    }

    if (callback) {
        process.nextTick(callback);
    }

}


/**
 * The JsonRpcConnector constructor
 * @param options
 * @constructor
 */
function JsonRpcConnector(options) {
    if (options.url || options.baseURL) {
        var parts = url.parse(options.url || options.baseURL);
        parts['host'] = parts['host'].split(':')[0];
        for (var p in parts) {
            if (!options.hasOwnProperty(p)) {
                options[p] = parts[p];
            }
        }
    }
    if (options.debug) {
        g.log('Options: %j', options);
    }
    this.options = options;

    if (options.operations) {
        if (options.protocol == "http:") {
            this.client = jayson.client.http(options);
        } else if (options.protocol == "https:") {
            this.client = jayson.client.https(options);
        }
    }
}

JsonRpcConnector.prototype.mapOperation = function (op) {
    var client = this.client;
    var fn = function () {
        var args = Array.prototype.slice.call(arguments);
        var cb = null;
        if (args.length > 0 && typeof args[args.length - 1] === 'function') {
            cb = args.pop();
        }
        client.request(op, args[0], function (err, res) {
            if(err) {
                cb && cb(err);
                return;
            }
            err = res && res.error;
            cb && cb(err, res && res.result);
        });
    }
    return fn;
}

JsonRpcConnector.prototype.getDataAccessObject = function () {
    if (this.DataAccessObject) {
        return this.DataAccessObject;
    }
    var self = this;
    var DataAccessObject = function () {
    };
    self.DataAccessObject = DataAccessObject;

    self.options.operations.forEach(function (op) {
        if (self.options.debug) {
            g.log('Mixing in method: %s', op);
        }
        self.DataAccessObject[op] = self.mapOperation(op);
    });
    return self.DataAccessObject;
}

