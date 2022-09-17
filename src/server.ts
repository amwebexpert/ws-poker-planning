import * as fs from 'fs';
import * as http from 'http';
import * as ws from 'ws';
import { service } from './service';

const port = process.env.PORT || 80;
const wss = new ws.Server({ noServer: true });

const accept = (request: http.IncomingMessage, response: http.ServerResponse) => {
    console.log('Accepting an incoming connection');

    if (isWebSocketRequest(request)) {
        console.log('Upgrading connection to websocket');
        wss.handleUpgrade(request, request.socket, Buffer.alloc(0), onSocketConnect);
    } else if (request.url == '/') {
        console.log('Returning static /index.html page');
        fs.createReadStream('./src/index.html').pipe(response);
    } else if (request.url == '/test.html') {
        console.log('Returning static /test.html page');
        fs.createReadStream('./src/test.html').pipe(response);
    } else {
        response.writeHead(404); // classic page not found
        response.end();
    }
};

const isWebSocketRequest = (request: http.IncomingMessage): boolean =>
    (request.url ?? '').startsWith('/ws') &&
    request.headers.upgrade?.toLowerCase() === 'websocket' &&
    /\bupgrade\b/i.test(request.headers.connection ?? ''); // can be Connection: keep-alive, Upgrade

const getRoomUUID = (request: http.IncomingMessage): string => {
    if (!request.url || !request.url.includes('?') || !request.url.includes('roomUUID=')) {
        return 'default';
    }

    const roomUUID = request.url.split('?roomUUID=')[1];
    return roomUUID;
};

const onSocketConnect = (socket: ws.WebSocket, request: http.IncomingMessage) =>
    service.addClient(getRoomUUID(request), socket);

console.log('Starting the server. Listening on port ', port);
http.createServer(accept).listen(port);
