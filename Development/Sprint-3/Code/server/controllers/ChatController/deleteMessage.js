import { Chat, Message } from '../../models/Chat.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const deleteMessage = async (req, res) => {
    try {
        const userId = req.user._id;
        const { messageId } = req.body;

        if (!messageId) {
            return res.status(400).json({
                success: false,
                message: 'Message ID is required'
            });
        }

        // Find message and verify ownership
        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.MESSAGE_NOT_FOUND
            });
        }

        // Verify user is the sender
        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: ERROR_MESSAGES.UNAUTHORIZED_CHAT_ACCESS
            });
        }

        // Delete the message
        await message.deleteOne();

        // If this was the last message in the chat, update the lastMessage
        const chat = await Chat.findById(message.chatId);
        if (chat.lastMessage && chat.lastMessage.content === message.content) {
            // Find the new last message
            const newLastMessage = await Message.findOne({ chatId: chat._id })
                .sort({ createdAt: -1 })
                .lean();

            if (newLastMessage) {
                chat.lastMessage = {
                    content: newLastMessage.content,
                    sender: newLastMessage.sender,
                    timestamp: newLastMessage.createdAt
                };
            } else {
                chat.lastMessage = null;
            }
            await chat.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });

    } catch (error) {
        console.error('Delete message error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};

export default deleteMessage;