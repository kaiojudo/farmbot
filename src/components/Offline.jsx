import React from 'react'

export default function Offline(props) {
    const {
        user, rankBuff, offlineTime, claimOffline, claimOfflinePro, hideOfflineMenu,totalOfflineTime
    } = props
    // console.log(user);
    return (
        <div className='offline'>
            <h1>Offline</h1>
            <p>You have been offline for {offlineTime} second</p>
            <p>{totalOfflineTime < 40 ? (user?.farmSpeed * rankBuff / 60 * totalOfflineTime * 0.7) : (user?.farmSpeed * rankBuff / 60 * 40 * 0.7)}</p>
            <div className='claim-button'>
                <button className='claim' onClick={claimOffline}>Claim</button>
                <button className='claimPro' onClick={claimOfflinePro}>Claim x 160%</button>
                <button className='btn-close' onClick={hideOfflineMenu}>X</button>
            </div>
        </div>
    )
}
