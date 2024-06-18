const express = require('express');
const router = express.Router();
const Rank = require('../models/Rank');

// Tạo Rank mới
router.post('/', async (req, res) => {
    const { id, rank_buff } = req.body;
    if (!id || !rank_buff) {
        return res.status(400).json({ message: 'Missing required rank information' });
    }
    try {
        const newRank = new Rank({ id, rank_buff });
        await newRank.save();
        res.json(newRank);
    } catch (error) {
        console.error('Error creating rank:', error);
        res.status(500).json({ message: 'Failed to create rank', error });
    }
});

// Lấy thông tin Rank
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const rank = await Rank.findOne({ id });
        if (!rank) {
            return res.status(404).json({ message: 'Rank not found' });
        }
        res.json(rank);
    } catch (error) {
        console.error('Error fetching rank:', error);
        res.status(500).json({ message: 'Failed to fetch rank', error });
    }
});

module.exports = router;
