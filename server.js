import http from "http";
import express from "express";
import { Server } from "socket.io";
import config from "config";

import index from "./service/index.js";
import webhook from "./dialogflow/webhook.js";
import ClientListener from "./service/ClientListener.js";

const serverConfig = config.get('server');
const port = serverConfig.port;

/**secure server
*
*/
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
});

app.use('/', index);
app.use('/dialogflow', webhook);

const httpServer = http.createServer(app);
const io = new Server(httpServer,{
    cors: {
        origin: "*"
    }
});

httpServer.listen(serverConfig.port);
httpServer.on('error', onError);
httpServer.on('listening', onListening);

new ClientListener(io);


function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    const addr = httpServer.address();
    console.log(addr)
}