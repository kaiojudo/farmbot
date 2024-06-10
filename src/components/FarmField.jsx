import React from 'react'

export default function FarmField(props) {
    const { user, farm, claimCoin, showLevelUp } = props
    return (
        <div>
            <p>Coin: ${farm?.toFixed(4)}</p>
            <button onClick={claimCoin}>Claim</button>
            <button onClick={showLevelUp}>Level Up</button>
            <p>Invite Link: https://t.me/tele_farming_bot?start={user.inviteRef}</p>
        </div>
    )
}
