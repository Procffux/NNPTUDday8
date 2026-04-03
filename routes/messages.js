const express = require('express');
const router = express.Router();
const messageSchema = require('../schemas/messages');
const { checkLogin } = require('../utils/authHandler');
const { uploadImage } = require('../utils/upload');

// GET / - Lấy tin nhắn cuối cùng của mỗi cuộc trò chuyện
router.get('/', checkLogin, async function (req, res, next) {
    try {
        const currentUser = req.user._id;

        const messages = await messageSchema.find({
            $or: [
                { from: currentUser },
                { to: currentUser }
            ]
        })
        .populate('from', 'username email')
        .populate('to', 'username email')
        .sort({ createdAt: -1 });

        const conversationMap = new Map();

        for (const msg of messages) {
            const otherUserId = msg.from._id.toString() === currentUser.toString()
                ? msg.to._id.toString()
                : msg.from._id.toString();

            if (!conversationMap.has(otherUserId)) {
                conversationMap.set(otherUserId, msg);
            }
        }

        const lastMessages = Array.from(conversationMap.values());

        res.send(lastMessages);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST /:userID - Gửi tin nhắn đến userID
router.post('/:userID', checkLogin, uploadImage.single('upload'), async function (req, res, next) {
    try {
        const currentUser = req.user._id;
        const toUser = req.params.userID;

        let messageContent;

        if (req.file) {
            messageContent = {
                type: 'file',
                text: req.file.path
            };
        } else {
            messageContent = {
                type: 'text',
                text: req.body.text
            };
        }

        const newMessage = new messageSchema({
            from: currentUser,
            to: toUser,
            messageContent
        });

        await newMessage.save();
        await newMessage.populate('from', 'username email');
        await newMessage.populate('to', 'username email');

        res.send(newMessage);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET /:userID - Lấy toàn bộ tin nhắn giữa user hiện tại và userID
router.get('/:userID', checkLogin, async function (req, res, next) {
    try {
        const currentUser = req.user._id;
        const otherUser = req.params.userID;

        const messages = await messageSchema.find({
            $or: [
                { from: currentUser, to: otherUser },
                { from: otherUser, to: currentUser }
            ]
        })
        .populate('from', 'username email')
        .populate('to', 'username email')
        .sort({ createdAt: 1 });

        res.send(messages);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
