import { Chat } from '../../models/Chat.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const getChatById = async (req, res) => {
    const { userId, chatId } = req.query;

    if (!chatId) return res.status(400).json({ success: false, message: 'Chat ID is required' });
    
    try 
    {
        // const userId = req.user._id;
        const chat = await Chat.findOne({
            _id: chatId,
            // participants: userId,
            isActive: true
        })
        .populate('participants', 'username profilePicture bio')
        .lean();

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.CHAT_NOT_FOUND
            });
        }

        // Format the response
        const otherParticipant = chat.participants.find(
            p => p._id.toString() !== userId.toString()
        );

        const formattedChat = {
            _id: chat._id,
            otherUser: otherParticipant,
            lastMessage: chat.lastMessage,
            unreadCount: chat.unreadCounts?.[userId.toString()] || 0,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt
        };

        return res.status(200).json({
            success: true,
            chat: formattedChat
        });

    } 
    catch (error) 
    {
        console.error('Get chat by ID error:', error);
        return res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
};