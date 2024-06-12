import React from 'react'

export default function FarmField(props) {
    const { user, farm, claimCoin, showLevelUp, nextClaim, invitedUsers } = props
    return (
        <div>
            <p>Coin: ${farm?.toFixed(4)}</p>
            <p>{(user.farmSpeed * 60).toFixed(4)} xLOTP/hour</p>
            {nextClaim && <p>Next Claim: {nextClaim.toLocaleString()}</p>}
            <button onClick={claimCoin}>Claim</button>
            <button onClick={showLevelUp}>Level Up</button>
            <p>Invite Link: https://t.me/tele_farming_bot?start={user.inviteRef}</p>
            <h2>Invited Users</h2>
            <ul className='show-invite'>
                <li>
                    <p>Name</p>
                    <p>Day Join</p>
                </li>
                {invitedUsers.map(user => (
                    <li key={user._id}>
                        <p>{user.username}</p>
                        <p>{new Date(user.dateCreate).toLocaleString().split(',')[0]}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}
