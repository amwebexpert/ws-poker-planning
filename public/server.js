"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var http = require("http");
var ws = require("ws");
var wss = new ws.Server({ noServer: true });
var clients = new Set();
function accept(req, res) {
    var _a;
    console.log('Accepting an incoming connection...');
    if (req.url == '/ws' &&
        req.headers.upgrade &&
        req.headers.upgrade.toLowerCase() === 'websocket' &&
        ((_a = req.headers.connection) === null || _a === void 0 ? void 0 : _a.match(/\bupgrade\b/i)) // can be Connection: keep-alive, Upgrade
    ) {
        console.log('Upgrading connection to websocket');
        wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onSocketConnect);
    }
    else if (req.url == '/') {
        // index.html
        console.log('Returning static page index.html file...');
        fs.createReadStream('./src/index.html').pipe(res);
    }
    else {
        // page not found
        console.log('Returning classic HTTP 404 NotFound');
        res.writeHead(404);
        res.end();
    }
}
function onSocketConnect(ws) {
    console.log('onSocketConnect: adding a new connected client');
    clients.add(ws);
    ws.on('message', function (value) {
        var message = "".concat(value);
        console.log('Server side onMessage:::', message);
        clients.forEach(function (client) { return client.send(message); });
    });
    ws.on('close', function () {
        console.log('Server side onClose');
        clients.delete(ws);
    });
}
var port = process.env.PORT || 80;
console.log('Starting the server. Listening on port ', port);
http.createServer(accept).listen(port);
//# sourceMappingURL=server.js.map