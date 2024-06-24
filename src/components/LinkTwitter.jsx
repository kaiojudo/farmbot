// LinkTwitter.js

import React from 'react';
import axios from 'axios';

const LinkTwitter = () => {

    const handleLinkTwitter = async () => {
        try {
            const response = await axios.get('http://pokegram.games/auth/twitter'); // Thay đổi thành endpoint backend của bạn
            const { redirectURL } = response.data;

            window.location.href = redirectURL; // Chuyển hướng người dùng đến Twitter OAuth
        } catch (error) {
            console.error('Error initiating Twitter OAuth:', error);
            // Xử lý lỗi nếu cần
        }
    };

    return (
        <div>
            <h1>Link Twitter Account</h1>
            <button onClick={handleLinkTwitter}>Link Twitter</button>
        </div>
    );
};

export default LinkTwitter;
