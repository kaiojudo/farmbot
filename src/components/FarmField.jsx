import React from 'react'

export default function FarmField(props) {
    const { user, farm, claimCoin, showLevelUp, nextClaim, invitedUsers, textAreaRef, handleCopyClick, copied, totalShareCoin, claimShareCoin, alertMax } = props
    const textToCopy = `https://t.me/farming_2024_bot?start=${user.inviteRef}`;
    return (
        <div>
            {alertMax && <p className='alertFull'>Full Coin, Please Claim</p>}
            <p>Coin: ${farm?.toFixed(4)}</p>
            <p>{(user.farmSpeed * 60).toFixed(4)} xLOTP/hour</p>
            {nextClaim &&
                <p>Next Claim: {nextClaim.toLocaleString()}</p>
            }
            <button onClick={claimCoin}>Claim</button>
            <button onClick={showLevelUp}>Level Up</button>
            <p>https://t.me/farming_2024_bot?start={user.inviteRef}</p>
            <textarea
                ref={textAreaRef}
                value={textToCopy}
                readOnly
                style={{ position: 'absolute', left: '-9999px' }}
            />
            <button onClick={handleCopyClick}>
                {copied ? 'Copied!' : 'Copy Link'}
            </button>
            {invitedUsers.length > 0 && (<>
                <h2>Invited Users</h2>
                <p>{totalShareCoin}</p>
                <button onClick={claimShareCoin}>Claim Share Coin</button>
                <ul className='show-invite'>
                    <li>
                        <p>Name</p>
                        <p>Day Join</p>
                        <p>Total Coin Share</p>
                    </li>
                    {invitedUsers.map(user => (
                        <li key={user._id}>
                            <p>{user.username}</p>
                            <p>{new Date(user.dateCreate).toLocaleString().split(',')[0]}</p>
                            <p>{user.totalShareCoin.toFixed(4)}</p>
                        </li>
                    ))}
                </ul>
            </>)}

        </div>
    )
}
