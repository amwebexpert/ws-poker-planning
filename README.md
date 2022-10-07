# WSPokerPlanning


![GitHub last commit](https://img.shields.io/github/last-commit/amwebexpert/ws-poker-planning) [![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE) ![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/amwebexpert/ws-poker-planning/typescript)

Poker planning sessions server handing communications through WebSocket. Once this server is started, it manages an in-memory map of rooms with connected socket clients. Sockets clients can specify a roomUUID and once connected all messages are private to that room.

1. the client side connects through a web socket URL and specify a roomUUID param. Example: `ws://localhost:8080/ws?roomUUID=xxxyyyzzz`
1. the server upgrades the connection to a full duplex web socket channel and reply with the whole room current state
1. the client socket can then:
   - emit a message to update the room state by using `socket.send()`
   - receive room updates asynchrously through the `socket.onmessage()`

## Build and start (production mode)

    npm run build
    npm start

## Start in development mode (with hot reload)

    npm run start:dev

## Localhost deployment

If the `process.env.PORT` is undefined the default port becomes `8080`

- ws://localhost:8080/ws

## WSPokerPlanning server production deployment

The `ws-poker-planning` server is a pure `Node.js` backend app that can be easyly deployed on public cloud engines like [Heroku](https://heroku.com/). You can deploy and start the app locally for testing purpose, but if you want real live web sockets support we suggest a deployment on:

- your own enterprise internal servers where all your VPN connected users can see the running server
- cloud solutions providers like `AWS`, `GCP`, `Azure`...

As a proof of concept the app has been deployed at the following location: `ws-poker-planning.herokuapp.com`. However starting November 28, 2022, free Heroku Dynos plans will no longer be available, so this deployment server will be shut down permanently. We strongly suggest to deploy it on your own internal server because:

- all your poker planning sessions are going to be private (only visible through your VPN for instance)
- you can still take advantages of the full poker planning client app (see below) since the hostname and port are just a configuration

## Full poker planning client app

The [Web Toolbox](https://amwebexpert.github.io/etoolbox/#/PokerPlanning) includes a full front end implementation of the Poker planning session. To start a poker planning session:

- ensure the server is up and running
- open the [Web Toolbox](https://amwebexpert.github.io/etoolbox/#/PokerPlanning) UI
- type the hostname:portnumber inside the `Server` field. No need to provide the port if it's the default one (`80` for `http` or `443` for `https`). For instance:
  - `ws-poker-planning.herokuapp.com`
- type the name of your team inside the `Team name` field
- type your username in the corresponding field
- press the share button so the full poker planning session link can be shared with other team members
- the resulting link is going to include the generated room number, the server, and the team name so it can be safely bookmarked for future poker planning sessions

## Full poker planning client app and server on LOCALHOST

The [Web Toolbox](https://github.com/amwebexpert/etoolbox#start-the-app-locally) GitHub project explains how to start the single page app locally. Once this app is started, you can then start a poker planning session server as follow:

- ensure the server is up and running by executing `npm run start:dev` which is going to start the server on `localhost:8080`
- open the UI locally at [http://localhost:3000/#/PokerPlanning](http://localhost:3000/#/PokerPlanning)
- type `localhost:8080` inside the `Server` field
- populate the name of your team inside the `Team name` field
- type your username in the corresponding field
- press the `JOIN` button

## Roadmap

- add an automatic cleanup of old rooms, based on lastUpdateISO8601 poker session attribute
  - send close signal on each socket of the room?
- add ability to become a room master (the one having more rights on UI side, like being able to remove members)


### References

- [WebSocket explained](https://javascript.info/websocket)
- [For a SPA push notification, is a websocket mandatory?](https://stackoverflow.com/questions/31035467/for-a-push-notification-is-a-websocket-mandatory)
- [Deploying a Node.js server with WebSockets on a free hosting Heroku](https://www.gamedev.net/blogs/entry/2272759-deploying-a-nodejs-server-with-websockets-on-a-free-hosting-heroku-web-desktop-clients-qt/)
- [Express WS service example](https://github.com/8Observer8/mouse-click-js)
- [Socket.IO enables real-time bidirectional event-based communication](https://github.com/socketio/socket.io)
- [ReconnectingWebSocket](https://github.com/joewalnes/reconnecting-websocket/)
- [GCP Using WebSockets](https://cloud.google.com/run/docs/triggering/websockets)

### WebSocket could be used also on mobile app (iOS, Android…) as it is mature and well known

- https://github.com/daltoniam/Starscream
- https://square.github.io/okhttp/4.x/okhttp/okhttp3/-web-socket/
