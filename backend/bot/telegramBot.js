const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User');
const UserInvite = require('../models/UserInvite');
const Quest = require('../models/Quest')
const generateInviteRef = require('../utils/generateInviteRef');
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start(?:\s+(\S+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const username = msg.from.username || '';
    const firstName = msg.from.first_name || '';
    const lastName = msg.from.last_name || '';
    const inviteBy = match[1] || null;

    try {
        let user = await User.findOne({ userId: chatId.toString() });

        if (!user) {
            let inviteRef;
            let isUnique = false;
            while (!isUnique) {
                inviteRef = generateInviteRef();
                const refExists = await User.findOne({ inviteRef });
                if (!refExists) {
                    isUnique = true;
                }
            }

            user = new User({
                userId: chatId.toString(),
                username: username,
                firstname: firstName,
                lastname: lastName,
                coin: 25,
                inviteRef: inviteRef,
                inviteBy: inviteBy,
                timeLogIn: new Date(),
                level: 1,
                rank: 1,
                cost: 25,
                lastClaimTime: null,
                farm: 0,
                joinQuest: 'no',
                totalCoin: 25,
                spendCoin: 0,
                totalOfflineTime: 0
            });

            if (!user.twitterId) {
                delete user.twitterId;
            }

            await user.save();
            // Tạo bản ghi mới trong Quest schema
            const newQuest = new Quest({
                userId: chatId.toString(),
                joinGroup: false,
                joinChannel: false
            });

            await newQuest.save();
            bot.sendMessage(chatId, 'Thông tin của bạn đã được lưu thành công!');

            // Gửi thông báo tới F0 nếu inviteRef tồn tại
            if (inviteRef) {
                const inviter = await User.findOne({ inviteRef: inviteBy });
                if (inviter) {
                    bot.sendMessage(inviter.userId, `User ${username} đã đăng ký thông qua invite link của bạn!`);

                    const userInvite = new UserInvite({
                        userId: chatId.toString(),
                        inviterId: inviter.userId,
                        username: username,
                        dateCreate: new Date()
                    });
                    await userInvite.save();

                }
            }
            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Join Channel', url: 'https://t.me/+7sgLDHJmunpmZDZl' }],
                        [{ text: 'Truy cập WebApp', url: 'https://t.me/tele_farming_bot/farming' }]
                    ]
                }
            };
            bot.sendMessage(chatId, 'Chào mừng bạn đến với bot của chúng tôi! Đây là các lựa chọn của bạn:', options);

        } else {
            const inviteLink = `https://t.me/tele_farming_bot?start=${user.inviteRef}`;

            const options = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Join Channel', url: 'https://t.me/+7sgLDHJmunpmZDZl' }],
                        [{ text: 'Truy cập WebApp', url: 'https://t.me/tele_farming_bot/farming' }]
                    ]
                }
            };

            await User.updateOne(
                { userId: chatId.toString() },
                { $set: { timeLogIn: new Date(), lastClaimTime: new Date() } }
            );

            bot.sendMessage(chatId, 'Chào mừng bạn quay trở lại! Đây là các lựa chọn của bạn:', options);
        }
    } catch (error) {
        console.error('Error saving user data:', error);
        bot.sendMessage(chatId, 'Có lỗi xảy ra khi lưu thông tin của bạn.');
    }
});

module.exports = bot;
