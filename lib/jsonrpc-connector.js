var jayson = require('jayson');
var url = require('url');

/**
 * Export the initialize method to loopback-data
 * @param dataSource
 * @param callback
 */
exports.initialize = function initializeDataSource(dataSource, callback) {
    var settings = dataSource.settings || {};
    var baseURL = settings.baseURL;


    var connector = new JsonRpcConnector(baseURL, settings.debug);
    dataSource.connector = connector;
    dataSource.connector.dataSource = dataSource;

    var DataAccessObject = function () {
    };
    connector.DataAccessObject = DataAccessObject;

    if (settings.operations) {
        var options = settings;
        if(baseURL) {
            var parts = url.parse(baseURL);
            parts['host'] = parts['host'].split(':')[0];
            for(var p in parts) {
                if(!options.hasOwnProperty(p)) {
                    options[p] = parts[p];
                }
            }
        }
        if (settings.debug) {
            console.log('Options: ', options);
        }

        var client = jayson.client.http(options);
        settings.operations.forEach(function (op) {
            if (settings.debug) {
                console.log('Mixing in method: ', op);
            }

            var fn = function () {
                var args = Array.prototype.slice.call(arguments);
                var cb = null;
                if (args.length > 0 && typeof args[args.length - 1] === 'function') {
                    cb = args.pop();
                }
                client.request(op, args, function (err, res) {
                    cb && cb(err, res && res.result);
                });
            }
            dataSource[op] = DataAccessObject[op] = fn;
        });
    }

}


/**
 * The JsonRpcConnector constructor
 * @param baseURL The base URL
 * @constructor
 */
function JsonRpcConnector(baseURL, debug) {
    this._baseURL = baseURL;
    this._debug = debug;
}

