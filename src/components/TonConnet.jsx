import React, { useState } from 'react';
import TonClient from 'ton-client-js';
import { TonConnectButton } from '@tonconnect/ui-react';

export default function TonConnet() {
    const [client, setClient] = useState < any > (null); // TonClient instance
    const [address, setAddress] = useState < string > (''); // Store TON Wallet address

    const connectTonWallet = async () => {
        try {
            // Initialize TonClient
            const client = await TonClient.create({
                network: {
                    server_address: 'main2.ton.dev', // Change to mainnet or testnet as needed
                },
            });

            // Save TonClient instance to state
            setClient(client);

            // Request permissions and connect wallet
            const { result } = await client.crypto.getSigningBox(); // Example request, adjust as per your needs

            // Extract wallet address
            const walletAddress = result.address;

            // Set wallet address in state
            setAddress(walletAddress);
        } catch (error) {
            console.error('TonConnect integration error:', error);
        }
    };

    return (
        <div>
            <h2>Connect TON Wallet Example</h2>
            <TonConnectButton onClick={connectTonWallet} />
            {address && <p>Connected TON Wallet Address: {address}</p>}
        </div>
    );
}
