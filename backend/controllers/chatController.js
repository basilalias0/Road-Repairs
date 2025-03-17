const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel'); // Adjust path
const User = require('../models/userModel'); // Adjust path
const Breakdown = require('../models/breakdownModel'); // Adjust path

const chatController = {
    // @desc    Create a new chat message
    // @route   POST /api/chats
    // @access  Private
    createChatMessage: asyncHandler(async (req, res) => {
        const { senderId, receiverId, content, breakdownId } = req.body;

        // Validate sender, receiver, and breakdown
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
        const breakdown = await Breakdown.findById(breakdownId);

        if (!sender || !receiver || !breakdown) {
            res.status(400);
            throw new Error('Invalid sender, receiver, or breakdown ID');
        }

        const chatMessage = await Chat.create({
            sender: senderId,
            receiver: receiverId,
            content,
            breakdown: breakdownId,
        });

        if (chatMessage) {
            res.status(201).json(chatMessage);
        } else {
            res.status(400);
            throw new Error('Chat message creation failed');
        }
    }),

    // @desc    Get all chat messages between two users for a specific breakdown
    // @route   GET /api/chats/:breakdownId/:userId1/:userId2
    // @access  Private
    getChatMessages: asyncHandler(async (req, res) => {
        const { breakdownId, userId1, userId2 } = req.params;

        // Validate breakdown
        const breakdown = await Breakdown.findById(breakdownId);
        if (!breakdown) {
            res.status(404);
            throw new Error('Breakdown not found');
        }

        const messages = await Chat.find({
            breakdown: breakdownId,
            $or: [
                { sender: userId1, receiver: userId2 },
                { sender: userId2, receiver: userId1 },
            ],
        })
            .sort({ createdAt: 1 })
            .populate({
                path: 'sender receiver',
                select: 'name email',
            })

        res.json(messages);
    }),

    // @desc    Get all chats for a specific user related to a specific breakdown
    // @route   GET /api/chats/:breakdownId/user/:userId
    // @access  Private
    getUserChats: asyncHandler(async (req, res) => {
        const { breakdownId, userId } = req.params;

        // Validate breakdown
        const breakdown = await Breakdown.findById(breakdownId);
        if (!breakdown) {
            res.status(404);
            throw new Error('Breakdown not found');
        }

        const chats = await Chat.find({
            breakdown: breakdownId,
            $or: [{ sender: userId }, { receiver: userId }],
        })
        .sort({ createdAt: 1 })
        .populate({
            path: 'sender receiver',
            select: 'name email',
        })

        res.json(chats);
    }),

    // @desc    Update chat message status
    // @route   PUT /api/chats/:id/status
    // @access  Private
    updateChatMessageStatus: asyncHandler(async (req, res) => {
        const { status } = req.body;

        const chatMessage = await Chat.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (chatMessage) {
            res.json(chatMessage);
        } else {
            res.status(404);
            throw new Error('Chat message not found');
        }
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

        if (
            chatMessage.sender.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            res.status(401);
            throw new Error('Not authorized to delete this message');
        }

        await Chat.findByIdAndDelete(req.params.id);
        res.json({ message: 'Chat message deleted successfully' });
    }),
};

module.exports = chatController;