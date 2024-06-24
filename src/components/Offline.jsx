import React from 'react'

export default function Offline(props) {
    const {
        user, rankBuff, offlineTime, claimOffline, claimOfflinePro, hideOfflineMenu
    } = props
    // console.log(rankBuff);
    return (
        <div className='offline'>
            <h1>Offline</h1>
            <p>You have been offline for {offlineTime} second</p>
            <p>{(offlineTime + user.totalOfflineTime) < 21600 ? (user?.farmSpeed * rankBuff / 60 * (offlineTime + user.totalOfflineTime) * 0.7) : (user?.farmSpeed * rankBuff / 60 * 40 * 0.7)}</p>
            <div className='claim-button'>
                <button className='claim' onClick={claimOffline}>Claim</button>
                <button className='claimPro' onClick={claimOfflinePro}>Claim x 160%</button>
                <button className='btn-close' onClick={hideOfflineMenu}>X</button>
            </div>
        </div>
    )
}
