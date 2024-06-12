import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './App.css'
import StartMenu from './components/StartMenu';
import Quest from './components/Quest';
import FarmField from './components/FarmField';
import { confirmAlert } from 'react-confirm-alert'; // Import thư viện
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import CSS
import ShowLevelUp from './components/ShowLevelUp';
import { message } from 'antd';
import CopyText from './components/CopyText';



function App() {
  const intervalRef = useRef(null);
  const [user, setUser] = useState(null);
  const [idTwitter, setIdTwitter] = useState('');
  const [tonWallet, setTonWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteBy, setInviteBy] = useState(null);
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

  const textAreaRef = useRef(null);

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
    const urlParams = new URLSearchParams(window.location.search);

    setInviteBy(urlParams.toString().split('=')[1]);
    fetchUser();
    // loginUser();
  }, [])
  const fetchUser = () => {
    const tg = window.Telegram?.WebApp;
    const userId = tg.initDataUnsafe?.user.id;
    axios.get(`http://localhost:5000/user/${userId}`)
      .then(
        response => {
          setUser(response?.data);
          setFarm(response?.data.farm);
          const userData = response?.data;
          if (userData.lastClaimTime) {
            const lastClaimTime = new Date(userData.lastClaimTime);
            const nextClaimTime = new Date(lastClaimTime.getTime() + 6 * 60 * 60 * 1000); // Cộng thêm 6 tiếng
            setNextClaim(nextClaimTime);
          }
          const fetchInvitedUsers = async () => {
            try {
              const res = await axios.get(`http://localhost:5000/inviteUser/search/${response.data.userId}`);
              if (res.data)
                setInvitedUsers(res.data);

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
  //
  const updateUserData = () => {
    const tg = window.Telegram?.WebApp;
    const userId = tg.initDataUnsafe?.user.id;
    axios.get(`http://localhost:5000/user/${userId}`)
      .then(
        response => {
          setUser(response?.data);
          const fetchInvitedUsers = async () => {
            try {
              const res = await axios.get(`http://localhost:5000/inviteUser/search/${response.data.userId}`);
              if (res.data)
                setInvitedUsers(res.data);

            } catch (error) {

            }
          };
          fetchInvitedUsers();
        }
      )
  }

  //Claim Coin
  const claimCoin = async () => {
    try {
      const userId = user.userId;
      const response = await axios.post(`http://localhost:5000/user/${userId}/claim`, { farm });
      setFarm(0);
      startFarming();
      updateUserData();

    } catch (error) {
      alert("Bạn chỉ được claim sau 6 tiêngs")
    }
  };

  const handleSaveUser = () => {

    const tg = window.Telegram?.WebApp;
    if (tg) {
      const user = tg.initDataUnsafe?.user;
      if (user) {
        if (!isValidTonWallet(tonWallet)) {
          alert("Ton wallet loi")
          return;
        }
        if (idTwitter == "") {
          alert("vui long nhap twId")
        }
        else {
          axios.post(`http://localhost:5000/user/${user.id}`, {
            username: user.username,
            firstname: user.first_name,
            lastname: user.last_name,
            checked: true,
            twitterId: idTwitter,
            tonWallet: tonWallet,
            inviteBy: inviteBy // Thêm inviteBy nếu có
          })
            .then(response => {
              console.log(user);
              setUser(response.data);
            })
            .catch(error => {
              if (error.response && error.response.data && error.response.data.message) {
                alert(error.response.data.message);
              } else {
                alert('Failed to save user data');
              }
            }
            )
            .finally(
              setLoading(true)
            );
        }

      }
    }
  };
  //show Menu Quest
  const showMenuQuest = () => {
    setQuest(!quest);
  }
  const startFarming = async () => {
    if (user && !intervalRef.current) {
      try {
        const response = await axios.get(`http://localhost:5000/rank/${user.rank}`);
        intervalRef.current = setInterval(() => {
          setFarm(prevFarm => {
            const newFarm = prevFarm + (user.farmSpeed * response.data.rank_buff / 60);
            axios.post(`http://localhost:5000/user/${user.userId}/updateFarm`, { farm: newFarm });
            return newFarm;
          });
        }, 1000);
      } catch (error) {
        console.error('Failed to fetch rank:', error);
      }
    }
  };
  //
  useEffect(() => {
    startFarming();
    // Xóa bỏ interval khi component được unmount hoặc khi user thay đổi
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user]);

  const levelUp = async () => {
    try {
      const userId = user?.userId;
      const response = await axios.post(`http://localhost:5000/user/${userId}/levelUp`);
      message.success(`Bạn nâng cấp lên level ${user?.level + 1} thành công!`);
      fetchUser();
      hideLevelUp();
    } catch (error) {
      console.error('Failed to level up:', error);
    }
  };
  const logout = async () => {
    try {
      const userId = user.userId; // Thay thế bằng userId thực tế
      const response = await axios.post(`http://localhost:5000/user/${userId}/logout`, { farm });
      console.log('User logged out:', response.data);
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.close();
      }
    } catch (error) {
      console.error('Failed to logout:', error);
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
      const response = await axios.post(`http://localhost:5000/quest/checkChannel/${userId}`, { timeout: 10000 });
      return response.data.joinChannel;
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái thành viên kênh:', error);
      return false;
    }
  };

  const checkGroup = async (userId) => {
    try {
      const response = await axios.post(`http://localhost:5000/quest/checkGroup/${userId}`, { timeout: 10000 });
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
    const response = await axios.post(`http://localhost:5000/user/updateQuest/${userId}`);
    if (response.data.message == 1) {
      setClaimQ(false);
      message.success(`Bạn nhận thưởng thành công!`);
      fetchUser();
    }
    else {
      message.error(`Bạn nhận chưa hoàn thành quest!`);

    }
  }
  return (

    <div className="App">
      <StartMenu
        user={user}
        handleSaveUser={handleSaveUser}
        idTwitter={idTwitter}
        tonWallet={tonWallet}
        setIdTwitter={setIdTwitter}
        setTonWallet={setTonWallet}
        loading={loading}
        showMenuQuest={showMenuQuest}
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
        />}
      {showMenuLevelUp && <ShowLevelUp
        user={user}
        levelUp={levelUp}
        hideLevelUp={hideLevelUp}
      />}
      <button onClick={handleLogoutClick}>
        Close WebApp
      </button>
      <CopyText />

    </div>

  );
}

export default App;
