import { Chat, Message } from '../../models/Chat.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const deleteChat = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId } = req.body;

        if (!chatId) {
            return res.status(400).json({
                success: false,
                message: 'Chat ID is required'
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

        // Soft delete the chat
        chat.isActive = false;
        await chat.save();

        return res.status(200).json({
            success: true,
            message: 'Chat deleted successfully'
        });

    } catch (error) {
        console.error('Delete chat error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};

export default deleteChat;