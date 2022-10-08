import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as ws from 'ws';
import { URL } from 'url';
import { pokerPlanningService } from './poker.planning.service';
import { APP_VERSION_INFO, LONG_VERSION_DATE } from './constants';

// Websockets are established using a specific HTTP request which is “upgraded”. If we don’t specify noServer then the
// Websocket server will create a HTTP server to handle the upgrade of the browser’s HTTP request to a websocket connection.
const wss = new ws.Server({ noServer: true });
const port = process.env.PORT ?? 8080;

const accept = (request: http.IncomingMessage, response: http.ServerResponse) => {
    console.log('Accepting an incoming connection');

    if (isWebSocketRequest(request)) {
        console.log('Upgrading connection to websocket');
        wss.handleUpgrade(request, request.socket, Buffer.alloc(0), onSocketConnect);
    } else if (request.url === '/') {
        const htmlFile = path.join(__dirname, 'html', 'index.html');
        fs.createReadStream(htmlFile).pipe(response);
    } else {
        response.writeHead(404); // classic page not found
        response.end();
    }
};

const isWebSocketRequest = (request: http.IncomingMessage): boolean =>
    (request.url ?? '').startsWith('/ws') &&
    request.headers.upgrade?.toLowerCase() === 'websocket' &&
    /\bupgrade\b/i.test(request.headers.connection ?? ''); // can be Connection: keep-alive, Upgrade

const getSearchParams = ({ url }: http.IncomingMessage): URLSearchParams =>
    url ? new URL(url, 'https://localhost').searchParams : new URLSearchParams();

const onSocketConnect = (socket: ws.WebSocket, request: http.IncomingMessage) => {
    const searchParams = getSearchParams(request);
    const roomUUID = searchParams.get('roomUUID') ?? 'default';

    pokerPlanningService.addClient(roomUUID, socket);
};

console.log(`Starting the [${APP_VERSION_INFO.NAME}] v${LONG_VERSION_DATE} on port ${port}`);
http.createServer(accept)
    .listen(port, () => console.log(`\t==> started: awaiting incoming requests on port ${port}`));
