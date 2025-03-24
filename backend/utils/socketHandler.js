// socketHandler.js
const Chat = require('../models/chatModel'); // Adjust path
const chatController = require('../controllers/chatController'); // Adjust path

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('joinRoom', ({ senderId, receiverId }) => {
            const room = [senderId, receiverId].sort().join('-');
            socket.join(room);
        });

        socket.on('chatMessage', async (msg) => {
            const { senderId, receiverId, message } = msg;
            const room = [senderId, receiverId].sort().join('-');

            try {
                const chatMessage = await chatController.createChatMessage(senderId, receiverId, message);

                io.to(room).emit('message', chatMessage);
            } catch (error) {
                console.error('Error saving or emitting message:', error);
            }
        });

        socket.on('messageReceived', async ({ messageId }) => {
            try {
                const chatMessage = await Chat.findByIdAndUpdate(
                    messageId,
                    { status: 'received' },
                    { new: true }
                );
                if (chatMessage) {
                    io.to(socket.id).emit('messageStatusUpdated', chatMessage);
                }
            } catch (error) {
                console.error('Error updating message status:', error);
            }
        });

        socket.on('messageRead', async ({ messageId }) => {
            try {
                const chatMessage = await Chat.findByIdAndUpdate(
                    messageId,
                    { status: 'read' },
                    { new: true }
                );
                if (chatMessage) {
                    io.to(socket.id).emit('messageStatusUpdated', chatMessage);
                }
            } catch (error) {
                console.error('Error updating message status:', error);
            }
        });

        socket.on('locationUpdate', async ({ userId, latitude, longitude }) => {
            // Broadcast the location update to users in the same room or to all users.
            io.emit('userLocationUpdated', { userId, latitude, longitude }); // Global broadcast.
            // Or you can emit to certain rooms.
        });
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};