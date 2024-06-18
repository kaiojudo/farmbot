const mongoose = require('mongoose');

const userInviteSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'User' },
    inviterId: { type: String, required: true, ref: 'User' },
    username: { type: String, required: true },
    dateCreate: { type: Date, default: Date.now },
    shareCoin: { type: Number, default: 0 },
    totalShareCoin: { type: Number, default: 0 }
});

const UserInvite = mongoose.model('UserInvite', userInviteSchema);

module.exports = UserInvite;
