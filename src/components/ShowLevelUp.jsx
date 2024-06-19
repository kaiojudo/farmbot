import React from 'react'
import './ShowLevelUp.css'
export default function ShowLevelUp(props) {
    const { user, levelUp, hideLevelUp } = props
    return (
        <div className='container'>
            <div className='show-level-up'>
                <div className='slu-title'>
                    <p>Level</p>
                    <p>Speed</p>
                    <p>Cost Upgrade</p>
                </div>
                {user?.level == 1 && (
                    <div className='level-up'>
                        <div className='current'>
                            <p>1</p>
                            <p>0.01$/60s</p>
                            <p>$25</p>
                        </div>
                        <div><p>to</p></div>
                        <div className='next'>
                            <p>2</p>
                            <p>0.011$/60s</p>
                        </div>
                    </div>)}
                {user?.level == 2 && (
                    <div className='level-up'>
                        <div className='current'>
                            <p>2</p>
                            <p>0.011$/60s</p>
                            <p>29.75</p>
                        </div>
                        <div><p>to</p></div>
                        <div className='next'>
                            <p>3</p>
                            <p>0.012$/60s</p>
                        </div>
                    </div>)}
                {user?.level > 2 && (
                    <div className='level-up'>
                        <div className='current'>
                            <p>{user?.level}</p>
                            <p>{(user?.farmSpeed).toFixed(4)}$/60s</p>
                            <p>{(user.cost).toFixed(4)}</p>
                        </div>
                        <div><p>to</p></div>
                        <div className='next'>
                            <p>{user?.level + 1}</p>
                            <p>{(Math.round((user.farmSpeed * (1.0955 + user.level * 0.0005)) * 10000) / 10000)}$/60s</p>
                        </div>
                    </div>)}

            </div>
            <div>
                <button onClick={levelUp} className='btn-accept'>Accept</button>
                <button className='btn-close' onClick={hideLevelUp}>X</button>
            </div>
        </div>

    )
}
