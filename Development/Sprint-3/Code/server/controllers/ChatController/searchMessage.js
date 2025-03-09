import { Message } from '../../models/Message.js';
import { Chat } from '../../models/Chat.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const searchMessages = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId, query } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        if (!chatId || !query) {
            return res.status(400).json({
                success: false,
                message: 'Chat ID and search query are required'
            });
        }

        // Verify chat exists and user is a participant
        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId,
            isActive: true
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.CHAT_NOT_FOUND
            });
        }

        // Create search query
        const searchCriteria = {
            chatId,
            content: { $regex: query, $options: 'i' }
        };

        // Get total count for pagination
        const totalMessages = await Message.countDocuments(searchCriteria);

        // Get matching messages
        const messages = await Message.find(searchCriteria)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'username profilePicture')
            .lean();

        return res.status(200).json({
            success: true,
            messages,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalMessages / limit),
                totalMessages,
                hasMore: skip + messages.length < totalMessages
            }
        });

    } catch (error) {
        console.error('Search messages error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};


export default searchMessages;