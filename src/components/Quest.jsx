import React from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';

export default function Quest(props) {
    const {
        user,
        joinChannel,
        joinGroup,
        channelButtonImg,
        groupButtonImg,
        handleCheckCh,
        handleCheckGr,
        claimJoinQuest,
        claimQ
    } = props;

    return (
        <div className='page'>
            {claimQ && (user?.joinQuest == 'can' || user?.joinQuest == 'no') && (
                <>
                    <ul className='check-menu'>
                        <li className='item'>
                            <a href="https://t.me/+7sgLDHJmunpmZDZl">
                                <button onClick={handleCheckCh} disabled={joinChannel} className='join'>
                                    <div className='li1'>
                                        <img src={channelButtonImg} alt={joinChannel ? "Checked" : "Unchecked"} />
                                        <span>Join my channel</span>
                                    </div>
                                    <div className='li2'>
                                        <ArrowRightOutlined />
                                    </div>
                                </button>
                            </a>
                        </li>
                        <li className='item'>
                            <a href="https://t.me/+AqZU4s4XZNRkMDVl">
                                <button onClick={handleCheckGr} disabled={joinGroup} className='join'>
                                    <div className='li1'>
                                        <img src={groupButtonImg} alt={joinGroup ? "Checked" : "Unchecked"} />
                                        <span>Join my group</span>
                                    </div>
                                    <div className='li2'>
                                        <ArrowRightOutlined />
                                    </div>
                                </button>
                            </a>
                        </li>
                    </ul>
                    {claimQ && <button type="primary" className='button-next' onClick={claimJoinQuest}>
                        Claim
                    </button>}
                </>
            )}


        </div>
    );
}

