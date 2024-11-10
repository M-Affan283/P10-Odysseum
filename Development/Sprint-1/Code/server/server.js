// Importing modules
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ERROR_MESSAGES } from './utils/constants.js';
import { setupSocket } from './socket.js';


// Initializing dotenv file
dotenv.config({ path: './config.env' });

// const environment = process.argv[2] || 'remote';
const environment = 'remote';
const MONGO_URI = environment === 'local' ? process.env.MONGODB_URI_LOCAL : process.env.MONGODB_URI_REMOTE;
const PORT = process.env.PORT || 8000;
const app = (await import('./app.js')).default;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("\nConnected to MongoDB");

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