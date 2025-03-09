/*
    Filename: chatRouter.js
    Author: Shahrez
    Description: Router for chat-related endpoints
*/

import express from "express";
import { getUserChats } from "../controllers/ChatController/getUserChats.js";
import { getChatById } from "../controllers/ChatController/getChatById.js";
import { getChatMessages } from "../controllers/ChatController/getChatMessages.js";
import { deleteChat } from "../controllers/ChatController/deleteChat.js";
import { deleteMessage } from "../controllers/ChatController/deleteMessage.js";
import { searchMessages } from "../controllers/ChatController/searchMessage.js";
import { createChat } from "../controllers/ChatController/createChat.js";

const chatRouter = express.Router();

chatRouter.get("/getUserChats", getUserChats);
chatRouter.get("/getChatById", getChatById);
chatRouter.get("/getChatMessages", getChatMessages);
chatRouter.get("/searchMessages", searchMessages);
chatRouter.post("/create", createChat);
chatRouter.delete("/deleteChat", deleteChat);
chatRouter.delete("/deleteMessage", deleteMessage);

export default chatRouter;