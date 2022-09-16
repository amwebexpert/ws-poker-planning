const express = require("express");
const http = require("http");
const ws = require("ws");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "./public")));
app.get("/", (req, res) => { res.sendFile(path.join(__dirname, "index.html")) });

const httpServer = http.createServer(app);
const wss = new ws.Server({ server: httpServer });
wss.on("connection",
    (ws) =>
    {
        console.log("Client connected");
        ws.onmessage =
            (event) =>
            {
                const msg = JSON.parse(event.data);
                console.log(msg.x + ", " + msg.y);
                // Send an answer
                const resp = {
                    x: msg.x,
                    y: msg.y
                }
                ws.send(JSON.stringify(resp));
            }
    });

const port = process.env.PORT || 3000;
httpServer.listen(port, () => { console.log("Server started. Port: ", port); });
