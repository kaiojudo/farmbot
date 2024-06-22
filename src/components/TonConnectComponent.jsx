import React from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';

const TonConnectComponent = ({ connectTonWallet, address }) => {
  return (
    <div>
      <h2>Connect TON Wallet Example</h2>
      <TonConnectButton onClick={connectTonWallet} />
      {address && <p>Connected TON Wallet Address: {address}</p>}
    </div>
  );
};

export default TonConnectComponent;