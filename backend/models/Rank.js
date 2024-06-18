const mongoose = require('mongoose');

const rankSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    rank_buff: { type: Number, required: true }
});

const Rank = mongoose.model('Rank', rankSchema);

module.exports = Rank;