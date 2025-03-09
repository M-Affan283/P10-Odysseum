/*
    Filename: chatRouter.js
    Author: Shahrez
    Description: Router for chat-related endpoints
*/

import express from "express";
import { 
    getUserChats,
    getChatById,
    getChatMessages,
    deleteChat,
    deleteMessage,
    searchMessages,
    createChat
} from "../controllers/ChatController/index.js";

const chatRouter = express.Router();

chatRouter.get("/getUserChats", getUserChats);
chatRouter.get("/getChatById", getChatById);
chatRouter.get("/getChatMessages", getChatMessages);
chatRouter.get("/searchMessages", searchMessages);
chatRouter.post("/create", createChat);
chatRouter.delete("/deleteChat", deleteChat);
chatRouter.delete("/deleteMessage", deleteMessage);

export default chatRouter;