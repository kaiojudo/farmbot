import React from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';

export default function Quest(props) {
    const {
        joinChannel,
        joinGroup,
        channelButtonImg,
        groupButtonImg,
        handleCheckCh,
        handleCheckGr,
        
    } = props;

    return (
        <div className='page'>
            <img src="./img2.jpg" alt="" />
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
            <button type="primary" className='button-next'>
                Bắt đầu ngay
            </button>
        </div>
    );
}

