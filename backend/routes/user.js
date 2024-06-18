const express = require('express');
const router = express.Router();
const User = require('../models/User');
const InviteUser = require('../models/UserInvite');
const generateInviteRef = require('../utils/generateInviteRef');
const TelegramBot = require('node-telegram-bot-api');
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(botToken);

function isValidTonWallet(wallet) {
    return /^UQ[a-zA-Z0-9_]{46}$/.test(wallet);
}
// Save user
router.post('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { username, firstname, lastname, checked, twitterId, tonWallet, inviteBy } = req.body;
    if (!username || !firstname || !lastname || !twitterId || !tonWallet) {
        return res.status(400).json({ message: 'Missing required user information' });
    }
    if (!isValidTonWallet(tonWallet)) {
        return res.status(400).json({ message: 'Invalid TON wallet address' });
    }
    try {
        const existingUser = await User.findOne({
            $or: [{ twitterId }, { tonWallet }]
        });
        if (existingUser) {
            let message = '';
            if (existingUser.twitterId === twitterId) {
                message = 'Twitter ID already exists';
            } else if (existingUser.tonWallet === tonWallet) {
                message = 'TON wallet already exists';
            }
            return res.status(400).json({ message });
        }

        let inviteRef;
        let isUnique = false;

        while (!isUnique) {
            inviteRef = generateInviteRef();
            const refExists = await User.findOne({ inviteRef });
            if (!refExists) {
                isUnique = true;
            }
        }

        const user = await User.findOneAndUpdate(
            { userId },
            {
                $setOnInsert: { userId, username, firstname, lastname, checked, coin: 1000, twitterId, tonWallet, inviteRef, inviteBy, level: 1, rank: 1, cost: 25, farmSpeed: 0.01 },
                $set: { timeLogIn: new Date() }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json(user);
    } catch (error) {
        console.error('Error in /user/:userId endpoint:', error);
        res.status(500).json({ message: 'Failed to fetch or create user data', error });
    }
});

// Get user by ID
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error in /user/:userId endpoint:', error);
        res.status(500).json({ message: 'Failed to fetch user data', error });
    }
});


// Claim coin and update inviter's coin
router.post('/:userId/claim', async (req, res) => {
    const { userId } = req.params;
    const { farm } = req.body;

    try {
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Kiểm tra thời gian của lần claim gần nhất
        const now = new Date();
        const FOUR_HOURS = 10 * 1000; // 10s
        // const FOUR_HOURS = 4 * 60 * 60 * 1000; // 4 tiếng
        if (user.lastClaimTime && (now - new Date(user.lastClaimTime)) < FOUR_HOURS) {
            return res.status(400).json({ message: 'You can only claim once every 4 hours.' });
        }

        // Calculate the coins to add to the user
        const coinsToAdd = farm;
        const updatedUser = await User.findOneAndUpdate(
            { userId },
            {
                $inc: { coin: coinsToAdd, totalCoin: coinsToAdd },
                $set: { lastClaimTime: now, farm: 0 } // Cập nhật thời gian claim gần nhất
            },
            { new: true }
        );

        // Tìm kiếm và cập nhật giá trị shareCoin cho người mời (inviter)
        const inviteUser = await InviteUser.findOne({ userId });
        if (inviteUser) {
            inviteUser.shareCoin += coinsToAdd * 0.1;
            inviteUser.totalShareCoin += coinsToAdd * 0.1; // Cộng thêm 10% giá trị claim vào shareCoin
            await inviteUser.save();
        }

        res.json(updatedUser);
    } catch (error) {
        console.error('Error in /user/:userId/claim endpoint:', error);
        res.status(500).json({ message: 'Failed to update coin', error });
    }
});
router.post('/:userId/claimoffline', async (req, res) => {
    const { userId } = req.params;
    const { offlineCoin } = req.body;

    try {
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const coinsToAdd = offlineCoin;
        const updatedUser = await User.findOneAndUpdate(
            { userId },
            {
                $inc: { coin: coinsToAdd, totalCoin: coinsToAdd },
                $set: { totalOfflineTime: 0 }

            },
            { new: true }
        );
        res.json(updatedUser);
    } catch (error) {
        console.error('Error in /user/:userId/claim endpoint:', error);
        res.status(500).json({ message: 'Failed to update coin', error });
    }
});
router.post('/:userId/levelUp', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.level == 1) {
            newFarmSpeed = 0.011
        }
        else if (user.level == 2) {
            newFarmSpeed = 0.012
        }
        else {
            newFarmSpeed = Math.round((user.farmSpeed * (1.0955 + user.level * 0.0005)) * 10000) / 10000;
        }
        if (user.coin >= user.cost) {
            let newCost;
            if (user.level == 1) {
                newCost = user.cost * 1.19;
            }
            else if (user.level == 2) {
                newCost = user.cost * (1.19 - 0.009);
            } else {
                newCost = user.cost * (1.181 - 0.0008 * (user.level - 2));
            }

            const updatedUser = await User.findOneAndUpdate(
                { userId },
                {
                    $inc: { level: 1, coin: -user.cost, spendCoin: user.cost },
                    $set: { cost: newCost, farmSpeed: newFarmSpeed }
                },
                { new: true }
            );

            res.json(updatedUser);
        } else {
            res.status(400).json({ message: 'Not enough coins to level up' });
        }
    } catch (error) {
        console.error('Error in /user/:userId/levelUp endpoint:', error);
        res.status(500).json({ message: 'Failed to level up', error });
    }
});
//Lưu trữ farm vào user
router.post('/:userId/updateFarm', async (req, res) => {
    const { userId } = req.params;
    const { farm } = req.body;

    try {
        const user = await User.findOneAndUpdate(
            { userId },
            { $set: { farm } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error in /user/:userId/updateFarm endpoint:', error);
        res.status(500).json({ message: 'Failed to update farm', error });
    }
});
//Claim Coin Join Quest
router.post('/updateQuest/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.joinQuest == 'can') {
            // Cập nhật joinQuest thành 'claimed' và tăng coin thêm 2
            user.joinQuest = 'claimed';
            user.coin += 2;
            user.totalCoin += 2;
            await user.save();
            res.json({ message: 1, user });

        }
        else {
            await user.save();
            res.json({ message: 0, user });

        }
    } catch (error) {
        console.error('Error in /updateQuest/:userId endpoint:', error);
        res.json();
    }
});

//Endpoint lấy ra tổng share coin của 1 id
router.get('/totalShareCoin/:inviterId', async (req, res) => {
    const { inviterId } = req.params;

    try {
        // Tìm tất cả các bản ghi InviteUser có cùng inviterId
        const inviteUsers = await InviteUser.find({ inviterId });

        if (!inviteUsers.length) {
            return res.status(404).json({ message: 'No records found for this inviterId' });
        }

        // Tính tổng shareCoin
        const totalShareCoin = inviteUsers.reduce((sum, record) => sum + record.shareCoin, 0);

        res.json({ message: 'Total shareCoin fetched successfully', totalShareCoin });
    } catch (error) {
        console.error('Error in /totalShareCoin/:inviterId endpoint:', error);
        res.status(500).json({ message: 'Failed to fetch total shareCoin', error });
    }
});
// Endpoint để claim tổng shareCoin của các bản ghi có chung inviterId
router.post('/claimShareCoin/:inviterId', async (req, res) => {
    const { inviterId } = req.params;

    try {
        // Tìm tất cả các bản ghi InviteUser có cùng inviterId
        const inviteUsers = await InviteUser.find({ inviterId });

        if (!inviteUsers.length) {
            return res.status(404).json({ message: 'No records found for this inviterId' });
        }

        // Tính tổng shareCoin
        const totalShareCoin = inviteUsers.reduce((sum, record) => sum + record.shareCoin, 0);

        // Cập nhật giá trị coin cho người dùng có inviterId
        const user = await User.findOne({ userId: inviterId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.coin += totalShareCoin;
        await user.save();

        // Đặt lại giá trị shareCoin của các bản ghi về 0
        await InviteUser.updateMany({ inviterId }, { shareCoin: 0 });

        res.json({ totalShareCoin });
    } catch (error) {
        console.error('Error in /claimShareCoin/:inviterId endpoint:', error);
        res.status(500).json({ message: 'Failed to claim shareCoin', error });
    }
});
// Endpoint để cập nhật timeLogIn
router.post('/:userId/login', async (req, res) => {
    const { userId } = req.params;
    const timeLogIn = new Date();

    try {
        const user = await User.findOneAndUpdate(
            { userId },
            { timeLogIn },
            { new: true, upsert: true }
        );

        let offlineTime = null;
        if (user && user.timeLogOut) {
            offlineTime = (new Date(timeLogIn) - new Date(user.timeLogOut)) / 1000; // Tính bằng giây
            if (offlineTime > 10) {
                const totalOfflineTime = (user.totalOfflineTime || 0) + (offlineTime - 10);
                user.totalOfflineTime = totalOfflineTime;
                await user.save();
            }
        }

        res.json({ timeLogIn: user.timeLogIn, timeLogOut: user.timeLogOut, offlineTime });
    } catch (error) {
        console.error('Error in /:userId/login endpoint:', error);
        res.status(500).json({ message: 'Failed to update login time', error });
    }
});

// Endpoint để lưu thời gian rời khỏi trang
router.post('/:userId/logout', async (req, res) => {
    const { userId } = req.params;
    const { timeLogOut } = req.body;

    try {
        const user = await User.findOneAndUpdate(
            { userId },
            { timeLogOut },
            { new: true }
        );

        res.json({ message: 'Logout time saved successfully', user });
    } catch (error) {
        console.error('Error in /:userId/logout endpoint:', error);
        res.status(500).json({ message: 'Failed to save logout time', error });
    }
});
module.exports = router;
module.exports = router;
