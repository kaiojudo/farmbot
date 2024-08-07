import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './App.css';
import connector from './tonConnectConfig';
import StartMenu from './components/StartMenu';
import Quest from './components/Quest';
import FarmField from './components/FarmField';
import { confirmAlert } from 'react-confirm-alert'; // Import thư viện
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import CSS
import ShowLevelUp from './components/ShowLevelUp';
import { message } from 'antd';
import CopyText from './components/CopyText';
import Offline from './components/Offline';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import TonConnectComponent from './components/TonConnectComponent';
import LinkTwitter from './components/LinkTwitter';
import Home from './components/Home';
function App() {
  const intervalRef = useRef(null);
  const [user, setUser] = useState(null);
  const [idTwitter, setIdTwitter] = useState('');
  const [tonWallet, setTonWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [quest, setQuest] = useState(false);
  const [farm, setFarm] = useState(0);
  const [showMenuLevelUp, setShowMenuLevelUp] = useState(false);
  const [nextClaim, setNextClaim] = useState(null);
  const [joinGroup, setJoinGroup] = useState(false);
  const [joinChannel, setJoinChannel] = useState(false);
  const [channelButtonImg, setChannelButtonImg] = useState('./checkbox.png');
  const [groupButtonImg, setGroupButtonImg] = useState('./checkbox.png');
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [claimQ, setClaimQ] = useState(true);
  const [copied, setCopied] = useState(false);
  const [totalShareCoin, setTotalShareCoin] = useState(0);
  const [rankBuff, setrankBuff] = useState(0);
  const [showOffline, setShowOffline] = useState(true);
  const [offlineTime, setOfflineTime] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [alertMax, setAlertMax] = useState(false);
  const [address, setAddress] = useState('');
  const [canClaim, setCanClaim] = useState(false)
  const [isDisable, setIsDisable] = useState(true);
  const [coin, setCoin] = useState(0);

  const tg = window.Telegram.WebApp;
  const userId = tg.initDataUnsafe?.user.id;
  const textAreaRef = useRef(null);

  const connectTonWallet = async () => {
    try {
      const client = new TonClient({
        network: {
          server_address: 'main.ton.dev',
        },
      });

      // Yêu cầu quyền và kết nối tới ví
      await tonClient.setup();

      // Lấy thông tin ví của người dùng
      const address = await tonClient.defaultWallet.getAddress();
      setAddress(walletAddress);
      return address;
    } catch (error) {
      console.error('Lỗi kết nối ví TON:', error);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      const wallets = await connector.getWallets();

      if (wallets.length > 0) {
        const address = localStorage.getItem('tonWalletAddress');
        if (address) {
          setWalletAddress(address);
        }
      }
    };

    checkConnection();
  }, []);


  //Websocket
  useEffect(() => {
    const userId = tg.initDataUnsafe?.user.id;
    const ws = new WebSocket('wss://websocket.pokegram.games');
    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      ws.send(JSON.stringify({ type: 'login', userId }));

    
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');


      // Gửi thông điệp logout chứa dữ liệu farm
      ws.send(message);
    };
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Message from server:', message);
      // Xử lý các tin nhắn từ server (cập nhật trạng thái người dùng, vv.)
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        ws.send(JSON.stringify({ type: 'logout', userId }));
        ws.close();
      } else if (document.visibilityState === 'visible') {
        const newWs = new WebSocket('wss://websocket.pokegram.games');
        newWs.onopen = () => {
          console.log('Reconnected to WebSocket server');
          newWs.send(JSON.stringify({ type: 'login', userId }));
        };
        newWs.onclose = ws.onclose;
        newWs.onmessage = ws.onmessage;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      ws.send(JSON.stringify({ type: 'logout', userId }));
      ws.close();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId]);



  const handleCopyClick = () => {
    if (textAreaRef.current) {
      textAreaRef.current.select();
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Đặt lại trạng thái sau 2 giây
    }
  };
  //Validate Tonwallet
  const isValidTonWallet = (wallet) => {
    return /^UQ[a-zA-Z0-9_]{46}$/.test(wallet);
  };
  useEffect(() => {
    fetchUser()
  }, [userId])
  const fetchUser = () => {
    const userId = tg.initDataUnsafe?.user.id;
    axios.get(`https://pokegram.games/user`,
      {
        params: {
          userId: userId
        }
      })
      .then(
        response => {
          console.log(response);
          setUser(response?.data);
          const userData = response?.data;
          if (userData.lastClaimTime) {
            const lastClaimTime = new Date(userData.lastClaimTime);
            const nextClaimTime = new Date(lastClaimTime.getTime() + 6 * 60 * 60 * 1000); // Cộng thêm 6 tiếng
            setNextClaim(nextClaimTime);
          }
          const fetchInvitedUsers = async () => {
            try {
              const res = await axios.get(`https://pokegram.games/inviteUser/search`, {
                params: {
                  inviterId: userId
                }
              });
              if (res.data != 0) {
                setInvitedUsers(res.data);
                // console.log(invitedUsers);
                const resp = await axios.get(`https://pokegram.games/user/totalShareCoin`, {
                  params: {
                    inviterId: userId
                  }
                });
                if (resp.data.totalShareCoin) {
                  setTotalShareCoin(resp.data.totalShareCoin);
                }
              }
              if (user.lastClaimTime) {
                const lastClaimTime = new Date();
                const nextClaimTime = new Date(lastClaimTime.getTime() + 6 * 60 * 60 * 1000); // Cộng thêm 6 tiếng
                setNextClaim(nextClaimTime);
              }
            } catch (error) {

            }
          };
          fetchInvitedUsers();
          if (userId) {
            checkMemberships(userId);
          }
        }
      )
      .finally(
        setLoading(true)
      )
  }
  //Claim Share Coin
  const claimShareCoin = async () => {
    const res = await axios.post(`https://pokegram.games/user/claimShareCoin`, { inviterId: userId })
    setTotalShareCoin(0);
    setCoin(coin + totalShareCoin);
    setNextClaim(user.nextClaimTime);

  }
  const updateData = () => {
    const tg = window.Telegram?.WebApp;
    const userId = tg.initDataUnsafe?.user.id;
    axios.get(`https://pokegram.games/user`, {
      params: {
        userId: userId
      }
    })
      .then(
        response => {
          setUser(response?.data);
        })
  }
  //Update UserData
  const updateUserData = () => {
    const tg = window.Telegram?.WebApp;
    const userId = tg.initDataUnsafe?.user.id;
    axios.get(`https://pokegram.games/user`, {
      params: {
        userId: userId
      }
    })
      .then(
        response => {
          setUser(response?.data);
          const fetchInvitedUsers = async () => {
            try {
              const res = await axios.get(`https://pokegram.games/inviteUser/search`, {
                params: {
                  userId: userId
                }
              });
              if (res.data != 0) {
                setInvitedUsers(res.data);
                // console.log(invitedUsers);
                axios.get(`https://pokegram.games/user/totalShareCoin`, {
                  params: {
                    userId: userId
                  }
                })
                  .then(
                    response => {
                      if (response.data.totalShareCoin) {
                        setTotalShareCoin(response.data.totalShareCoin);
                      }
                    }
                  )
              }
            } catch (error) {
            }
          };
          fetchInvitedUsers();
        }
      )
  }
  //UpdateClaim
  const UpdateClaimTime = () => {
    const lastClaimTime = new Date();
    const nextClaimTime = new Date(lastClaimTime.getTime() + 6 * 60 * 60 * 1000); // Cộng thêm 6 tiếng
    setNextClaim(nextClaimTime);
  }
  //Claim Coin
  const claimCoin = async () => {
    try {
      const response = await axios.post(`https://pokegram.games/user/claim`, { userId });
      setFarm(0);
      const response2 = await axios.get(`https://pokegram.games/rank/${user.rank}`);
      if (response2.data) {
        setrankBuff(response.data.rank_buff);
      }

      intervalRef.current = setInterval(() => {
        setFarm(prevFarm => {
          const newFarm = prevFarm + (user.farmSpeed * response2.data.rank_buff / 60);
          const maxFarm = (user.farmSpeed * response2.data.rank_buff) * 60 * 6 * 60;
          if (newFarm < maxFarm)
            return newFarm;
          setAlertMax(true);
          return maxFarm;
        });
      }, 1000);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        farmingStartedRef.current = false;
      }
      setCoin(coin + farm);
      setAlertMax(false);
      UpdateClaimTime();
      setCanClaim(false);
      farmingStartedRef.current = false; // Đặt cờ để đảm bảo chỉ chạy một lần
      setIsDisable(true);
    } catch (error) {
      alert("Bạn chỉ được claim sau 6 tiếng")
    }
  };
  //show Menu Quest
  const showMenuQuest = () => {
    setQuest(!quest);
  }
  const farmingStartedRef = useRef(false); // Thêm cờ để kiểm soát việc bắt đầu farming

  const startFarming = async () => {
    console.log(intervalRef.current);
    console.log(farmingStartedRef.current);
    console.log(alertMax);
    if (user && !intervalRef.current && !farmingStartedRef.current && !alertMax) {
      farmingStartedRef.current = true; // Đặt cờ để đảm bảo chỉ chạy một lần
      try {
        const response = await axios.get(`https://pokegram.games/rank/${user.rank}`);
        if (response.data) {
          setrankBuff(response.data.rank_buff);
        }

        intervalRef.current = setInterval(() => {
          setFarm(prevFarm => {
            const newFarm = prevFarm + (user.farmSpeed * response.data.rank_buff / 60);
            const maxFarm = (user.farmSpeed * response.data.rank_buff) * 60 * 6 * 60;
            if (newFarm < maxFarm)
              return newFarm;
            setAlertMax(true);
            return maxFarm;
          });
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch rank:', error);
      }
      return 'Farming started';
    }
    return 'Farming not started';
  };

  const handleStartFarming = async () => {
    const result = await startFarming();
    console.log('Result from startFarming:', result);
  };

  useEffect(() => {
    if (user?.farm >= 0 && !intervalRef.current && !farmingStartedRef.current) {
      handleStartFarming();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        farmingStartedRef.current = false;
      }
    };
  }, [user]);
  const levelUp = async () => {
    try {
      const userId = user?.userId;
      const response = await axios.post(`https://pokegram.games/user/levelUp`, { userId });
      if (response.data != 0) {
        message.success(`Bạn nâng cấp lên level ${user?.level + 1} thành công!`);
        updateData();
        hideLevelUp();
        setCoin(coin - user.cost)
      }
      else {
        alert("Not Enough Money")
      }

    } catch (error) {
      console.error('Failed to level up:', error);
    }
  };
  const handleLogoutClick = () => {
    confirmAlert({
      title: 'Confirm to logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => logout()
        },
        {
          label: 'No',
          onClick: () => { }
        }
      ]
    });
  };
  const showLevelUp = () => {
    setShowMenuLevelUp(true)
  }
  const hideLevelUp = () => {
    setShowMenuLevelUp(false)
  }
  const checkMemberships = async (userId) => {
    const isChannelMember = await checkChannel(userId);
    const isGroupMember = await checkGroup(userId);

    setJoinChannel(isChannelMember);
    setJoinGroup(isGroupMember);

    if (isChannelMember) {
      setChannelButtonImg('./check.png');
    } else {
      setChannelButtonImg('./checkbox.png');
    }

    if (isGroupMember) {
      setGroupButtonImg('./check.png');
    } else {
      setGroupButtonImg('./checkbox.png');
    }
  };

  const checkChannel = async (userId) => {
    try {
      const response = await axios.post(`https://pokegram.games/quest/checkChannel`, { userId }, { timeout: 10000 });
      return response.data.joinChannel;
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái thành viên kênh:', error);
      return false;
    }
  };

  const checkGroup = async (userId) => {
    try {
      const response = await axios.post(`https://pokegram.games/quest/checkGroup`, { userId }, { timeout: 10000 });
      return response.data.joinGroup;
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái thành viên nhóm:', error);
      return false;
    }
  };
  // console.log(joinChannel);
  // console.log(joinGroup);
  const handleCheckCh = async () => {
    setChannelButtonImg('./loading.png');
    await new Promise(resolve => setTimeout(resolve, 5000));
    const isMember = await checkChannel(user.userId);
    setTimeout(() => {
      if (isMember) {
        setJoinChannel(true);
        setChannelButtonImg('./check.png');
      } else {
        setJoinChannel(false);
        setChannelButtonImg('./checkbox.png');
        message.warning('Bạn chưa tham gia kênh.');
      }
    }, 5000);
  };
  const handleCheckGr = async () => {
    setGroupButtonImg('./loading.png');
    await new Promise(resolve => setTimeout(resolve, 5000));
    const isMember = await checkGroup(user.userId);
    setTimeout(() => {
      if (isMember) {
        setJoinGroup(true);
        setGroupButtonImg('./check.png');
      } else {
        setJoinGroup(false);
        setGroupButtonImg('./checkbox.png');
        message.warning('Bạn chưa tham gia nhóm.');
      }
    }, 5000);
  };
  //Claim Join Quest
  const claimJoinQuest = async () => {
    const userId = user.userId;
    const response = await axios.post(`https://pokegram.games/user/updateQuest`, { userId });
    if (response.data.message == 1) {
      setClaimQ(false);
      setCoin(coin + 2);
      message.success(`Bạn nhận thưởng thành công!`);

    }
    else {
      message.error(`Bạn nhận chưa hoàn thành quest!`);

    }
  }
  const claimOffline = async () => {
    try {
      const userId = user.userId;
      let offlineCoin = 0;
      if (offlineTime + user.totalOfflineTime < 21600) {
        offlineCoin = user?.farmSpeed * rankBuff / 60 * (offlineTime + user.totalOfflineTime) * 0.7;
      }
      else {
        offlineCoin = user?.farmSpeed * rankBuff / 60 * 21600 * 0.7;
      }
      const response = await axios.post(`https://pokegram.games/user/claimoffline`, { userId });
      updateData();
      hideOfflineMenu();
      setCoin(coin + offlineCoin);

    } catch (error) {
      console.log(error);
    }
  }
  const claimOfflinePro = async () => {
    try {
      const userId = user.userId;
      let offlineCoin = 0;
      if (user.totalOfflineTime < 21600) {
        offlineCoin = user?.farmSpeed * rankBuff / 60 * user.totalOfflineTime * 1.6;
      }
      else {
        offlineCoin = user?.farmSpeed * rankBuff / 60 * 21600 * 1.6;
      }
      const response = await axios.post(`https://pokegram.games/user/claimofflinepro`, { userId });
      updateData();
      hideOfflineMenu();
      setCoin(coin + offlineCoin);

    } catch (error) {
      alert("Bạn chỉ được claim sau 6 hours")
    }
  }
  const hideOfflineMenu = () => {
    setShowOffline(false);
  }
  const connectTwitter = async () => {
    window.location.href = 'https://pokegram.games/auth/twitter';
  };



  //Caculator time
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [percentComplete, setPercentComplete] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      const timeLeft = calculateTimeLeft();
      setTimeLeft(timeLeft);
      const currentTime = +new Date();
      const elapsedTime = (nextClaim - currentTime);
      if (elapsedTime <= 0) {
        setPercentComplete(100);
        setCanClaim(true);
        setIsDisable(false);
      }
      else {
        const percentage = (1 - (elapsedTime / (6 * 60 * 60 * 1000))) * 100;
        if (percentage > 99.995) {
          setCanClaim(true);
          setPercentComplete(100);
          setIsDisable(false);
        }
        else {
          setPercentComplete(percentage);
        }
      }
      if (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
        clearInterval(timer);
      }

    }, 1000); // update every second

    return () => clearInterval(timer);
  }, [nextClaim]);

  function calculateTimeLeft() {
    const difference = +new Date(nextClaim) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }

    return timeLeft;
  }

  return (

    <div className="App">
      <StartMenu
        user={user}
        idTwitter={idTwitter}
        tonWallet={tonWallet}
        setIdTwitter={setIdTwitter}
        setTonWallet={setTonWallet}
        loading={loading}
        showMenuQuest={showMenuQuest}
        coin={coin}
      />
      <button onClick={showMenuQuest}>Quest</button>
      {quest && <Quest
        claimQ={claimQ}
        user={user}
        joinChannel={joinChannel}
        joinGroup={joinGroup}
        channelButtonImg={channelButtonImg}
        groupButtonImg={groupButtonImg}
        handleCheckCh={handleCheckCh}
        handleCheckGr={handleCheckGr}
        claimJoinQuest={claimJoinQuest}


      />}
      {user &&
        <FarmField
          user={user}
          farm={farm}
          claimCoin={claimCoin}
          showLevelUp={showLevelUp}
          levelUp={levelUp}
          nextClaim={nextClaim}
          invitedUsers={invitedUsers}
          handleCopyClick={handleCopyClick}
          textAreaRef={textAreaRef}
          copied={copied}
          totalShareCoin={totalShareCoin}
          claimShareCoin={claimShareCoin}
          alertMax={alertMax}
          timeLeft={timeLeft}
          percentComplete={percentComplete}
          canClaim={canClaim}
          isDisable={isDisable}
        />}
      {showMenuLevelUp && <ShowLevelUp
        user={user}
        levelUp={levelUp}
        hideLevelUp={hideLevelUp}
      />}
      <button onClick={handleLogoutClick} className='close'>
        Close WebApp
      </button>
      <CopyText />
      {(user?.totalOfflineTime + offlineTime > 600 && showOffline) &&
        <Offline
          user={user}
          rankBuff={rankBuff}
          offlineTime={offlineTime}
          claimOffline={claimOffline}
          claimOfflinePro={claimOfflinePro}
          hideOfflineMenu={hideOfflineMenu}
        />}
      <TonConnectUIProvider
        manifestUrl="https://farmbot-omega.vercel.app/tonconnect-manifest.json"
      >
        <div>
          <TonConnectComponent connectTonWallet={connectTonWallet} address={address} />
        </div>
      </TonConnectUIProvider>
      <LinkTwitter />
      <Home />
    </div>

  );
}

export default App;
