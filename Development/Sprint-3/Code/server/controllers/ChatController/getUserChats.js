import { Chat } from '../../models/Chat.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const getUserChats = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const totalChats = await Chat.countDocuments({
            participants: userId,
            isActive: true
        });

        // Get chats with last message and other participant's details
        const chats = await Chat.find({
            participants: userId,
            isActive: true
        })
        .sort({ 'lastMessage.timestamp': -1 })
        .skip(skip)
        .limit(limit)
        .populate('participants', 'username profilePicture')
        .lean();

        // Format the response
        const formattedChats = chats.map(chat => {
            const otherParticipant = chat.participants.find(
                p => p._id.toString() !== userId.toString()
            );
            
            return {
                _id: chat._id,
                otherUser: otherParticipant,
                lastMessage: chat.lastMessage,
                unreadCount: chat.unreadCounts.get(userId.toString()) || 0,
                updatedAt: chat.updatedAt
            };
        });

        return res.status(200).json({
            success: true,
            chats: formattedChats,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalChats / limit),
                totalChats,
                hasMore: skip + chats.length < totalChats
            }
        });

    } catch (error) {
        console.error('Get user chats error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};

export default getUserChats;