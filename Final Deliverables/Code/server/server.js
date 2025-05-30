import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import { ERROR_MESSAGES } from './utils/constants.js';
import { setupSocket } from './socket.js';
import app from './app.js';

// Initializing dotenv file
dotenv.config({ path: './config.env' });

const environment = process.argv[2] || 'remote';
const MONGO_URI = environment === 'local' ? process.env.MONGODB_URI_LOCAL : process.env.MONGODB_URI_REMOTE;

// Use the provided port or default to 8000
const PORT = process.env.PORT || 8000;

mongoose.connect(MONGO_URI)
.then(async()=>
{
    console.log("\n[SERVER] Connected to MongoDB");
    // Initializing HTTP server and socket server
    const server = http.createServer(app)
    // socket server will run in paraller to express server
    const io = setupSocket(server);         

    // Start the server and listen for incoming requests
    server.listen(PORT, () => {
        console.log(`[SERVER] ${environment.toUpperCase()} server running on port ${PORT} at ${new Date().toLocaleString()}`);
    });
})
.catch((error)=> {
    console.log("\n[SERVER] Could not connect");
    console.log(ERROR_MESSAGES.DATABASE_CONNECTION_ERROR, ": ", error);
});
