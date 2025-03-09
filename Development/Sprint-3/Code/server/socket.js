import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from './models/User.js';
import { Chat } from './models/Chat.js';
import { Message } from './models/Message.js';

// Store online users and their connection counts
const onlineUsers = new Map();
const userConnections = new Map();
const MAX_CONNECTIONS_PER_USER = 5;

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        },
        allowEIO3: true,
        pingTimeout: 60000,
        pingInterval: 25000,
        transports: ['websocket', 'polling']
    });

    // Socket authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return next(new Error('User not found'));
            }

            // Check connection limit
            const currentConnections = userConnections.get(user._id.toString()) || 0;
            if (currentConnections >= MAX_CONNECTIONS_PER_USER) {
                return next(new Error('Maximum connection limit reached'));
            }

            // Increment connection count
            userConnections.set(user._id.toString(), currentConnections + 1);
            
            socket.user = user;
            next();
        } catch (error) {
            return next(new Error('Authentication error'));
        }
    });

    io.on('connection', async (socket) => {
        console.log(`User connected: ${socket.user._id}`);
        
        // Add user to online users
        onlineUsers.set(socket.user._id.toString(), socket.id);
        
        // Broadcast user's online status
        io.emit('user_status', {
            userId: socket.user._id,
            status: 'online'
        });

        // Join user to their personal room
        socket.join(socket.user._id.toString());

        // Handle incoming messages
        socket.on('send_message', async (data) => {
            try {
                const { receiverId, content, mediaUrl, mediaType } = data;
                
                // Find or create chat
                let chat = await Chat.findOne({
                    participants: {
                        $all: [socket.user._id, receiverId]
                    }
                });

                if (!chat) {
                    chat = await Chat.create({
                        participants: [socket.user._id, receiverId],
                        unreadCounts: { [receiverId]: 1 }
                    });
                } else {
                    // Update unread count for receiver
                    if (!chat.unreadCounts) {
                        chat.unreadCounts = {};
                    }
                    const currentCount = chat.unreadCounts[receiverId] || 0;
                    chat.unreadCounts[receiverId] = currentCount + 1;
                    await chat.save();
                }

                // Create message
                const message = await Message.create({
                    chatId: chat._id,
                    sender: socket.user._id,
                    receiver: receiverId,
                    content,
                    mediaUrl,
                    mediaType
                });

                // Update last message in chat
                chat.lastMessage = {
                    content,
                    sender: socket.user._id,
                    timestamp: new Date()
                };
                await chat.save();

                // Emit to receiver if online
                const receiverSocketId = onlineUsers.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive_message', {
                        message,
                        chat
                    });
                }

                // Emit back to sender
                socket.emit('message_sent', {
                    message,
                    chat
                });

            } catch (error) {
                console.error('Message error:', error);
                socket.emit('message_error', {
                    error: 'Failed to send message'
                });
            }
        });

        // Handle typing status
        socket.on('typing_start', (data) => {
            const receiverSocketId = onlineUsers.get(data.receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user_typing', {
                    userId: socket.user._id,
                    status: true
                });
            }
        });

        socket.on('typing_end', (data) => {
            const receiverSocketId = onlineUsers.get(data.receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('user_typing', {
                    userId: socket.user._id,
                    status: false
                });
            }
        });

        // Handle message read status
        socket.on('mark_read', async (data) => {
            try {
                const { chatId } = data;
                
                // Update messages
                await Message.updateMany(
                    {
                        chatId,
                        receiver: socket.user._id,
                        read: false
                    },
                    { read: true }
                );

                // Update unread count in chat
                const chat = await Chat.findById(chatId);
                if (chat) {
                    if (!chat.unreadCounts) {
                        chat.unreadCounts = {};
                    }
                    chat.unreadCounts[socket.user._id.toString()] = 0;
                    await chat.save();

                    // Notify other participant
                    const otherParticipant = chat.participants
                        .find(p => p.toString() !== socket.user._id.toString());
                    
                    const otherSocketId = onlineUsers.get(otherParticipant.toString());
                    if (otherSocketId) {
                        io.to(otherSocketId).emit('messages_read', {
                            chatId,
                            readBy: socket.user._id
                        });
                    }
                }
            } catch (error) {
                console.error('Mark read error:', error);
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user._id}`);
            
            // Update connection count
            const userId = socket.user._id.toString();
            const currentConnections = userConnections.get(userId) || 1;
            if (currentConnections <= 1) {
                userConnections.delete(userId);
                onlineUsers.delete(userId);
            } else {
                userConnections.set(userId, currentConnections - 1);
            }
            
            // Broadcast user's offline status
            io.emit('user_status', {
                userId: socket.user._id,
                status: 'offline'
            });
        });
    });

    return io;
};