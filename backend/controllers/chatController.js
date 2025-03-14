const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const User = require('../models/userModel'); // For user validation

const chatController = {
    // @desc    Create a new chat message
    // @route   POST /api/chats
    // @access  Private
    createChatMessage: asyncHandler(async (req, res) => {
        const { senderId, receiverId, message } = req.body;

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            res.status(400);
            throw new Error('Invalid sender or receiver ID');
        }

        const chatMessage = await Chat.create({
            sender: senderId,
            receiver: receiverId,
            message,
        });

        if (chatMessage) {
            // Emit the new message to the receiver via Socket.IO (if used)
            // io.to(receiverId).emit('newMessage', chatMessage);

            res.status(201).json(chatMessage);
        } else {
            res.status(400);
            throw new Error('Chat message creation failed');
        }
    }),

    // @desc    Get all chat messages between two users
    // @route   GET /api/chats/:userId1/:userId2
    // @access  Private
    getChatMessages: asyncHandler(async (req, res) => {
        const { userId1, userId2 } = req.params;

        const messages = await Chat.find({
            $or: [
                { sender: userId1, receiver: userId2 },
                { sender: userId2, receiver: userId1 },
            ],
        }).sort({ createdAt: 1 }).populate('sender').populate('receiver');

        res.json(messages);
    }),

    // @desc    Get all chats for a specific user
    // @route GET /api/chats/user/:userId
    // @access Private
    getUserChats: asyncHandler(async(req, res) => {
        const {userId} = req.params;

        const chats = await Chat.find({
            $or: [
                {sender: userId},
                {receiver: userId}
            ]
        }).sort({createdAt: 1}).populate('sender').populate('receiver');

        res.json(chats);
    }),

    // @desc    Delete a chat message
    // @route   DELETE /api/chats/:id
    // @access  Private (Message owner or Admin)
    deleteChatMessage: asyncHandler(async (req, res) => {
        const chatMessage = await Chat.findById(req.params.id);

        if (!chatMessage) {
            res.status(404);
            throw new Error('Chat message not found');
        }

        if (chatMessage.sender.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized to delete this message');
        }

        await chatMessage.remove();
        res.json({ message: 'Chat message deleted successfully' });
    }),
};

module.exports = chatController;