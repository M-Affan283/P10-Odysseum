// Importing modules
import express, { application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
// import { db, storage } from './config/firebase.js'
// import { Location } from './models/Location.js';
// import { User } from './models/User.js';


// Importing routes
import userRouter from './routes/userRouter.js';
import postRouter from './routes/postRouter.js';
import commentRouter from './routes/commentRouter.js';
import locationRouter from "./routes/locationRouter.js";

import { checkServerHealth } from './utils/serverHealthUtils.js';

// Initializing variables
const app = express();
const SERVER_START_TIME = new Date()

// Configuring middleware
app.use((req,res,next) => { // clears console on every request to make it easier to read logs
    console.clear();
    next();
})
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HEALTH CHECK (for AWS)

//------------------ Route Configurations ------------------- //

app.get('/', (req,res) => {
    return res.status(200).json({message: "Welcome to Odysseum API Here is the list of available routes", routes: ['/api/user', '/api/post', '/api/comment', '/api/location']});
})

app.get('/health', async (req,res)=>
{
    let health = await checkServerHealth(SERVER_START_TIME);

    return res.status(200).json(health);
})

app.use('/api/user', userRouter)
app.use('/api/post', postRouter)
app.use("/api/location", locationRouter);
app.use('/api/comment', commentRouter)
// app.use('/api/itinerary', itineraryRouter)
// app.use('/api/review', reviewRouter)
// app.use('/api/chat', chatRouter)
// app.use('/api/notification', notificationRouter)
// app.use('/api/ai', aiRouter)


export default app;