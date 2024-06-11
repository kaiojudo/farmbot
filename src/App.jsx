import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import StartMenu from './components/StartMenu';
import Quest from './components/Quest';
import FarmField from './components/FarmField';
import { confirmAlert } from 'react-confirm-alert'; // Import thư viện
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import CSS
import ShowLevelUp from './components/ShowLevelUp';
import { message } from 'antd';



function App() {
  const intervalRef = useRef(null);
  const [user, setUser] = useState(null);
  const [idTwitter, setIdTwitter] = useState('');
  const [tonWallet, setTonWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [inviteBy, setInviteBy] = useState(null);
  const [quest, setQuest] = useState(false);
  const [farm, setFarm] = useState(0);
  const [rank, setRank] = useState(0);
  const [showMenuLevelUp, setShowMenuLevelUp] = useState(false);

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
        }
      )
      .finally(
        setLoading(true)
      )
  }
  const claimCoin = async () => {
    try {
      const userId = user.userId;
      const response = await axios.post(`http://localhost:5000/user/${userId}/claim`, { farm });

      // Reset farm to 0 after claiming
      setFarm(0);
      const res = axios.post(`http://localhost:5000/user/${userId}/logout`, { farm: 0 });
      // Dừng farming trong 2 giây
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setTimeout(() => {
        startFarming();
      }, 2000); // Đợi 2 giây trước khi tiếp tục farming

    } catch (error) {
      alert("Bạn chỉ được claim sau 6 tiêngs")
    }
    finally {
      fetchUser();
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

  // Hàm xử lý khi người dùng nhấn nút "Copy Invite Link"
  const handleCopyInviteLink = (inviteRef) => {
    const inviteLink = `https://t.me/tele_farming_bot/farming?start=${inviteRef}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopyMessage('Invite link copied to clipboard!');
      setTimeout(() => setCopyMessage(''), 3000); // Xóa thông báo sau 3 giây
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };
  //show Menu Quest
  const showMenuQuest = () => {
    setQuest(!quest);
  }

  //
  useEffect(() => {
    const startFarming = async () => {
      if (user && !intervalRef.current) {
        try {
          const response = await axios.get(`http://localhost:5000/rank/${user.rank}`);
          intervalRef.current = setInterval(() => {
            setFarm(prevFarm => {
              const newFarm = prevFarm + (user.farmSpeed * response.data.rank_buff / 60);
              axios.post(`http://localhost:5000/user/${user.userId}/updateFarm`, { farm: newFarm });
              console.log("Farm");
              return newFarm;
            });
          }, 1000);
        } catch (error) {
          console.error('Failed to fetch rank:', error);
        }
      }
    };

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
        handleCopyInviteLink={handleCopyInviteLink}
        copyMessage={copyMessage}
        showMenuQuest={showMenuQuest}
      />
      <button onClick={showMenuQuest}>Quest</button>
      {quest && <Quest />}
      {user &&
        <FarmField
          user={user}
          farm={farm}
          claimCoin={claimCoin}
          showLevelUp={showLevelUp}
          levelUp={levelUp}
        />}
      {showMenuLevelUp && <ShowLevelUp
        user={user}
        levelUp={levelUp}
        hideLevelUp={hideLevelUp}
      />}
      <button onClick={handleLogoutClick}>
        Close WebApp
      </button>
    </div>

  );
}

export default App;
