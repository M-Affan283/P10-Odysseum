import { Chat, Message } from '../../models/Chat.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const getChatMessages = async (req, res) => {
    try {
        const { userId } = req.query;
        const { chatId } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Verify chat exists and user is a participant
        const chat = await Chat.findOne({
            _id: chatId,
            // participants: userId,
            isActive: true
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.CHAT_NOT_FOUND
            });
        }

        // Get total count for pagination
        const totalMessages = await Message.countDocuments({ chatId });

        // Get messages with populated sender details
        const messages = await Message.find({ chatId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'username profilePicture')
            .lean();

        // Mark messages as read if user is receiver
        await Message.updateMany(
            {
                chatId,
                receiver: userId,
                read: false
            },
            { read: true }
        );

        // Update unread count in chat
        if (!chat.unreadCounts) {
            chat.unreadCounts = {};
        }
        chat.unreadCounts[userId.toString()] = 0;
        await chat.save();

        return res.status(200).json({
            success: true,
            messages: messages.reverse(), // Return in chronological order
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalMessages / limit),
                totalMessages,
                hasMore: skip + messages.length < totalMessages
            }
        });

    } catch (error) {
        console.error('Get chat messages error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};