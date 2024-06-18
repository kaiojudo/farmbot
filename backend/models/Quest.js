const mongoose = require('mongoose');
const questSchema = new mongoose.Schema({
    userId: { type: String, unique: true, required: true },
    joinGroup: { type: Boolean, default: false },
    joinChannel: { type: Boolean, default: false }
});

const Quest = mongoose.model('Quest', questSchema);

module.exports = Quest;
