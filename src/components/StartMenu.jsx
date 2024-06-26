import React from 'react'

export default function StartMenu(props) {
    const { user, coin, idTwitter, tonWallet, setIdTwitter, setTonWallet, loading } = props;
    return (
        <div className='start-menu'>
            <h1>Welcome to My Telegram WebApp</h1>
            {user && loading ? (
                <div>
                    <p>Farm Menu</p>
                    <p>{user.firstname} {user.lastname} Level: {user.level}</p>
                    <p>{coin.toFixed(4)}</p>
                </div>
            ) : (
                <div className='loading'>
                    <img src="./loadingimg.jpg" alt="" />
                </div>
            )}
        </div>
    )
}
