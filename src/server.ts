import Bowser from 'bowser';
import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';
import { URL } from 'url';
import * as ws from 'ws';

import { APP_VERSION_INFO, LONG_VERSION_DATE } from './constants';
import { pokerPlanningService } from './poker-planning.service';

// Websockets are established using a specific HTTP request which is “upgraded”. If we don’t specify noServer then the
// Websocket server will create a HTTP server to handle the upgrade of the browser’s HTTP request to a websocket connection.
const wss = new ws.Server({ noServer: true });
const port = process.env.PORT ?? 8080;
const htmlFile = path.join(__dirname, 'html', 'index.html');

const accept = (request: http.IncomingMessage, response: http.ServerResponse) => {
    logIncomingRequestInfo(request);

    if (isWebSocketRequest(request)) {
        console.log('\tupgrading connection to websocket');
        wss.handleUpgrade(request, request.socket, Buffer.alloc(0), onSocketConnect);
    } else if (request.url === '/') {
        fs.createReadStream(htmlFile).pipe(response);
    } else {
        response.writeHead(404); // classic page not found
        response.end();
    }
};

const logIncomingRequestInfo = (request: http.IncomingMessage) => {
    const ip = extractRemoteIp(request);
    const { url, headers } = request;
    const browser = extractBrowserInfo(headers['user-agent']);
    const info = { ip, url, browser };

    console.log(`incoming connection: ${JSON.stringify(info)}`);
};

const extractBrowserInfo = (userAgent: string = ''): string => {
    const { name, version } = Bowser.getParser(userAgent).getBrowser();
    return `${name} v${version}`;
};

const extractRemoteIp = (request: http.IncomingMessage): string => {
    const xForwardedFor = request.headers['x-forwarded-for']
    if (xForwardedFor) {
        if (Array.isArray(xForwardedFor)) {
            return xForwardedFor[0];
        }

        return xForwardedFor;
    }

    return request.socket.remoteAddress ?? 'unknown';
};

const isWebSocketRequest = (request: http.IncomingMessage): boolean => {
    const url = request.url ?? '';
    if (!url.startsWith('/ws')) {
        return false;
    }

    if (request.headers.upgrade?.toLowerCase() !== 'websocket') {
        return false;
    }

    // can be Connection: keep-alive, Upgrade
    const connectionHeader = request.headers.connection ?? '';
    return /\bupgrade\b/i.test(connectionHeader);
};

const getSearchParams = ({ url }: http.IncomingMessage) =>
    url ? new URL(url, 'https://localhost').searchParams : new URLSearchParams();

const onSocketConnect = (socket: ws.WebSocket, request: http.IncomingMessage) => {
    const searchParams = getSearchParams(request);
    const roomUUID = searchParams.get('roomUUID') ?? 'default';
    const browser = extractBrowserInfo(request.headers['user-agent']);
    const ip = extractRemoteIp(request);

    pokerPlanningService.addClient({ roomUUID, socket, browser, ip });
};

console.log(`Starting the [${APP_VERSION_INFO.NAME}] v${LONG_VERSION_DATE} on port ${port}`);
const server = http.createServer(accept);
server.listen(port, () => console.log(`\t==> started: awaiting incoming requests on port ${port}`));
