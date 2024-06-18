const express = require('express');
const router = express.Router();
const Quest = require('../models/Quest');
const User = require('../models/User');
const axios = require('axios');

const TELEGRAM_CHANNEL_ID = '-1002178702852'; // Đảm bảo rằng Chat ID đúng
const TELEGRAM_GROUP_ID = '-1002246118708'; // Thay thế bằng Chat ID của nhóm
// Hàm kiểm tra người dùng có ở trong channel
const isUserInChannel = async (userId) => {
    try {
        const response = await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChatMember`, {
            params: {
                chat_id: TELEGRAM_CHANNEL_ID,
                user_id: userId
            }
        });
        return response.data.result.status === 'member' || response.data.result.status === 'administrator' || response.data.result.status === 'creator';
    } catch (error) {
        console.error('Error checking user in channel:', error);
        return false;
    }
};

// Hàm kiểm tra người dùng có ở trong group
const isUserInGroup = async (userId) => {
    try {
        const response = await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChatMember`, {
            params: {
                chat_id: TELEGRAM_GROUP_ID,
                user_id: userId
            }
        });
        return response.data.result.status === 'member' || response.data.result.status === 'administrator' || response.data.result.status === 'creator';
    } catch (error) {
        console.error('Error checking user in group:', error);
        return false;
    }
};

// Endpoint để kiểm tra người dùng có ở trong channel không
router.post('/checkChannel/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const isInChannel = await isUserInChannel(userId);

        if (isInChannel) {
            await Quest.findOneAndUpdate(
                { userId },
                { joinChannel: true },
                { new: true, upsert: true }
            );
            await updateJoinQuest(userId);
            return res.json({ message: 'User is in the channel', joinChannel: true });
        } else {
            return res.json({ message: 'User is not in the channel', joinChannel: false });
        }
    } catch (error) {
        console.error('Error in /quest/checkChannel/:userId endpoint:', error);
        res.status(500).json({ message: 'Failed to check user in channel', error });
    }
});

// Endpoint để kiểm tra người dùng có ở trong group không
router.post('/checkGroup/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const isInGroup = await isUserInGroup(userId);

        if (isInGroup) {
            await Quest.findOneAndUpdate(
                { userId },
                { joinGroup: true },
                { new: true, upsert: true }
            );
            await updateJoinQuest(userId);
            return res.json({ message: 'User is in the group', joinGroup: true });
        } else {
            return res.json({ message: 'User is not in the group', joinGroup: false });
        }
    } catch (error) {
        console.error('Error in /quest/checkGroup/:userId endpoint:', error);
        res.status(500).json({ message: 'Failed to check user in group', error });
    }
});
const updateJoinQuest = async (userId) => {
    try {
        const quest = await Quest.findOne({ userId });
        const user = await User.findOne({ userId });
        if (quest && quest.joinChannel && quest.joinGroup && user.joinQuest === 'no') {
            await User.findOneAndUpdate(
                { userId },
                { joinQuest: 'can' },
                { new: true }
            );
        }
    } catch (error) {
        console.error('Error updating joinQuest:', error);
    }
};

module.exports = router;