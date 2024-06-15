import React from 'react';
import connector from '../tonConnectConfig';

const ConnectWalletButton = ({ setWalletAddress }) => {
    const connectWallet = async () => {
        try {
            const { address } = await connector.connect();
            setWalletAddress(address);
            localStorage.setItem('tonWalletAddress', address); // Lưu địa chỉ ví vào localStorage
        } catch (error) {
            console.error('Error connecting to wallet:', error);
        }
    };

    return <button onClick={connectWallet}>Connect TON Wallet</button>;
};

export default ConnectWalletButton;
