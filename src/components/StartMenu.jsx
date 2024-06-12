import React from 'react'

export default function StartMenu(props) {
    const { user, idTwitter, tonWallet, setIdTwitter, setTonWallet, handleSaveUser, loading } = props;
    return (
        <div className='start-menu'>
            <h1>Welcome to My Telegram WebApp</h1>
            {user && loading ? (
                <div>
                    <p>Farm Menu</p>
                    <p>{user.firstname} {user.lastname} Level: {user.level}</p>
                    <p>{(user.coin).toFixed(4)}</p>
                </div>
            ) : (
                <div>
                    <input
                        type="text"
                        placeholder="Enter Telegram ID"
                        value={idTwitter}
                        onChange={(e) => setIdTwitter(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Enter TON Wallet"
                        value={tonWallet}
                        onChange={(e) => setTonWallet(e.target.value)}
                    />
                    <button onClick={handleSaveUser}>Save User</button>
                </div>
            )}
        </div>
    )
}
