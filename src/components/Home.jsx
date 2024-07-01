import React from 'react'
import './Home.css'
export default function Home() {
  return (
    <div className='home background'>
      <div className='total-money'>
        <div className='icon'>
          <div className='img'><img src="../icon.png" alt="" /></div>
          <div className='total-coin'>
            <p>ETH Balance</p>
            <p className='coin'>0.00015124<span className='eth'>ETH</span></p>
          </div>
        </div>
        <div className='send'>
          <button>Send</button>
        </div>
      </div>
      <div className='ar'>
        <div className='arbx-balance'>
          <div className='frame-3'>
            <img src="../icon.png" alt="" />
            <p className='p1'>ARBX Balance</p>
            <p className='p2'>100.000 <span>ARBX</span></p>
          </div>
        </div>
        <div className='arb-balance'>
          <div className='frame-3'>
            <div className='d-flex jcs'>
              <img src="../arb.png" alt="" className='' />
              <button className='bsl'>Send</button>
            </div>
            <div>
              <p className='p1'>ARB Balance</p>
              <p className='p2'>100.000 <span>ARB</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className='mining-art'>
        <div className='frame'>
          <img src="../Group.png" alt="" className='img-gr'/>
          <img src="../Frameindex.png" alt="" className='img-fr'/>
        </div>
      </div>

    </div>
  )
}
