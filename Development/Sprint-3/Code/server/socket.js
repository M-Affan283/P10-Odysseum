/*

Filename: socket.js

This file contains the socket.io server setup. It listens for incoming connections and handles messaging.

Author: Affan

*/

import { Server } from 'socket.io'; // for messaging

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
        }
    });

    //------------------ Socket IO Handling (for chat. add later) ------------------- //
    // ------------------------ ------------------------------------------//


    return io;
}