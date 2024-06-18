const express = require('express');
const router = express.Router();
const InviteUser = require('../models/UserInvite');

// Endpoint để tìm kiếm dữ liệu bằng inviterId
router.get('/search/:inviterId', async (req, res) => {
    const { inviterId } = req.params;

    try {
        const inviteUsers = await InviteUser.find({ inviterId });

        if (!inviteUsers || inviteUsers.length === 0) {
            return res.json(0);
        }

        res.json(inviteUsers);
    } catch (error) {
        res.json(0);
    }
});

module.exports = router;
