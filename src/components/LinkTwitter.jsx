// LinkTwitter.js

import React from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const LinkTwitter = () => {
    const history = useHistory();

    const handleLinkTwitter = async () => {
        try {
            const response = await axios.get('/auth/twitter'); // Thay đổi thành endpoint backend của bạn
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
