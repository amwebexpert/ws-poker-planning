"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var http = require("http");
var ws = require("ws");
var url_1 = require("url");
var service_1 = require("./service");
var port = process.env.PORT || 80;
var wss = new ws.Server({ noServer: true });
var accept = function (request, response) {
    console.log('Accepting an incoming connection');
    if (isWebSocketRequest(request)) {
        console.log('Upgrading connection to websocket');
        wss.handleUpgrade(request, request.socket, Buffer.alloc(0), onSocketConnect);
    }
    else if (request.url == '/') {
        console.log('Returning static /index.html page');
        fs.createReadStream('./src/index.html').pipe(response);
    }
    else if (request.url == '/test.html') {
        console.log('Returning static /test.html page');
        fs.createReadStream('./src/test.html').pipe(response);
    }
    else {
        response.writeHead(404); // classic page not found
        response.end();
    }
};
var isWebSocketRequest = function (request) {
    var _a, _b, _c;
    return ((_a = request.url) !== null && _a !== void 0 ? _a : '').startsWith('/ws') &&
        ((_b = request.headers.upgrade) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === 'websocket' &&
        /\bupgrade\b/i.test((_c = request.headers.connection) !== null && _c !== void 0 ? _c : '');
}; // can be Connection: keep-alive, Upgrade
var getSearchParams = function (_a) {
    var url = _a.url;
    return url ? new url_1.URL(url, 'https://localhost').searchParams : new URLSearchParams();
};
var onSocketConnect = function (socket, request) {
    var _a;
    var searchParams = getSearchParams(request);
    var roomUUID = (_a = searchParams.get('roomUUID')) !== null && _a !== void 0 ? _a : 'default';
    service_1.service.addClient(roomUUID, socket);
};
console.log('Starting the server. Listening on port ', port);
http.createServer(accept).listen(port);
//# sourceMappingURL=server.js.map