/*

Filename: app.js

This file is the entry point for the express app. It creates an express app and listens on a port for incoming requests.

Routes, schemas, controllers will be defined in their own files/folders.

The express server here is exported to server.js where it is used to create a http server and socket.io server.

*/

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { checkServerHealth } from './utils/serverHealthUtils.js';

import post_router from './routes/postRouter.js';
import user_router from './routes/userRouter.js';

const app = express();

// Initial Middleware. Remaning middleware (e.g. jwt,multer) will be added in their respective files


// Clear console on every request so that it is easier to read logs
app.use((req,res,next)=>
{
    console.clear();
    next();
})

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HEALTH CHECK (for AWS)
//------------------ Routes (add later) ------------------- //

const SERVER_START_TIME = new Date()

app.post('/health', async (req,res)=>
{
    let health = await checkServerHealth(SERVER_START_TIME);

    return res.status(200).json(health);
})


app.use('/api/user', user_router);
app.use('/api/post', post_router);
// ------------------------ ------------------------------ //

export default app;