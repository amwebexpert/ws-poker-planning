"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var http = require("http");
var ws = require("ws");
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
var getRoomUUID = function (request) {
    if (!request.url || !request.url.includes('?') || !request.url.includes('roomUUID=')) {
        return 'default';
    }
    var roomUUID = request.url.split('?roomUUID=')[1];
    return roomUUID;
};
var onSocketConnect = function (socket, request) {
    return service_1.service.addClient(getRoomUUID(request), socket);
};
console.log('Starting the server. Listening on port ', port);
http.createServer(accept).listen(port);
//# sourceMappingURL=server.js.map