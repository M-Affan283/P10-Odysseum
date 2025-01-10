/*

Filename: server.js

This file is the entry point for the server. It creates an express app and listens on a port for incoming requests.

Routes, schemas, controllers will be defined in their own files/folders.

This file contain initial setup for the server, such as connecting to the database, setting up middleware, etc.

*/

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http'; // for messaging
import { ERROR_MESSAGES } from './utils/constants.js';
import { setupSocket } from './socket.js';

// Initializing dotenv file
dotenv.config({ path: './config.env' });
const app = (await import('./app.js')).default; //importing using this so that app.js can access the environment variables


const environment = process.argv[2] || 'remote';
const MONGO_URI = environment === 'local' ? process.env.MONGODB_URI_LOCAL : process.env.MONGODB_URI_REMOTE;

//Local if mongodb compass is being used
const PORT = process.env.PORT || 8000;

mongoose.connect(MONGO_URI)
.then(()=>
{
    console.log("Connected to MongoDB");

      // Initializing HTTP server and socket server
      const server = http.createServer(app)
      const io = setupSocket(server);         // socket server will run in paraller to express server

      // Starting the server and listening for incoming requests
      server.listen(PORT, () => {
          console.log(`${environment.toUpperCase()} Server running on port ${PORT} at ${new Date().toLocaleString()}`);
      });
  })
  .catch((error)=> {
      console.log("Could not connect");
      console.log(ERROR_MESSAGES.DATABASE_CONNECTION_ERROR, ": ", error);
  });