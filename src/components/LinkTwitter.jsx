// LinkTwitter.js

import React from 'react';
import axios from 'axios';

const LinkTwitter = () => {

    const handleLinkTwitter = async () => {
        window.location.href = 'https://pokegram.games/auth/twitter';
    };

    return (
        <div>
            <h1>Link Twitter Account</h1>
            <button onClick={handleLinkTwitter}>Link Twitter</button>
        </div>
    );
};

export default LinkTwitter;
