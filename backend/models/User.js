const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, unique: true, required: true },
    username: String,
    firstname: String,
    lastname: String,
    checked: Boolean,
    coin: { type: Number, default: 0 },
    twitterId: { type: String, unique: true, sparse: true },
    tonWallet: {
        type: String,
        unique: true,
        validate: {
            validator: function (v) {
                return v === '' || /^UQ[a-zA-Z0-9]{46}$/.test(v);
            },
            message: props => `${props.value} is not a valid TON wallet address!`
        }
    },
    inviteRef: {
        type: String,
        default: null,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9]{12}$/.test(v);
            }
        }
    },
    inviteBy: { type: String, default: null },
    timeLogIn: { type: Date, default: null },
    timeLogOut: { type: Date, default: null },
    level: { type: Number, default: 1 },
    rank: { type: Number, default: 1 },
    cost: { type: Number, default: 25 },
    farmSpeed: { type: Number, default: 0.01 },
    lastClaimTime: { type: Date, default: null },
    farm: { type: Number, default: 0 },
    joinQuest: { type: String, default: 'no' },
    spendCoin: { type: Number, default: 0 },
    totalCoin: { type: Number, default: 0 },
    totalOfflineTime: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
