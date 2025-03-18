import { Chat } from '../../models/Chat.js';
import { User } from '../../models/User.js';
import { ERROR_MESSAGES } from '../../utils/constants.js';

export const createChat = async (req, res) => {

    const { userId, otherUserId } = req.body;
    
    if (!otherUserId) return res.status(400).json({success: false,message: 'Other user ID is required'});
    
    try 
    {
        // const userId = req.user._id;


        // Check if other user exists
        const otherUser = await User.findById(otherUserId);
        if (!otherUser) return res.status(404).json({success: false,message: ERROR_MESSAGES.USER_NOT_FOUND});

        // Check if chat already exists
        const existingChat = await Chat.findOne({
            participants: {
                $all: [userId, otherUserId]
            },
            isActive: true
        }).populate('participants', 'username profilePicture');

        if (existingChat) {
            const otherParticipant = existingChat.participants.find(
                p => p._id.toString() !== userId.toString()
            );

            return res.status(200).json({
                success: true,
                chat: {
                    _id: existingChat._id,
                    otherUser: otherParticipant,
                    lastMessage: existingChat.lastMessage,
                    unreadCount: existingChat.unreadCounts?.[userId.toString()] || 0,
                    createdAt: existingChat.createdAt,
                    updatedAt: existingChat.updatedAt
                }
            });
        }

        // Create new chat
        const newChat = await Chat.create({
            participants: [userId, otherUserId],
            unreadCounts: new Map()
        });

        // Get populated chat
        const populatedChat = await Chat.findById(newChat._id)
            .populate('participants', 'username profilePicture')
            .lean();

        const otherParticipant = populatedChat.participants.find(
            p => p._id.toString() !== userId.toString()
        );

        return res.status(201).json({
            success: true,
            chat: {
                _id: populatedChat._id,
                otherUser: otherParticipant,
                lastMessage: null,
                unreadCount: 0,
                createdAt: populatedChat.createdAt,
                updatedAt: populatedChat.updatedAt
            }
        });

    } 
    catch (error) 
    {
        console.error('Create chat error:', error);
        return res.status(500).json({ success: false, message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
};

export default createChat;