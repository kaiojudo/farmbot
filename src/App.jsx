import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StartMenu from './components/StartMenu';
import Quest from './components/Quest';
import FarmField from './components/FarmField';
import { confirmAlert } from 'react-confirm-alert'; // Import thư viện
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import CSS
import ShowLevelUp from './components/ShowLevelUp';
import { message } from 'antd';



function App() {
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
    axios.get(`https://pokegram.games/user/${userId}`)
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
  useEffect(() => {
    const res = axios.post(`https://pokegram.games/user/${user?.userId}/logout`, { farm });

  }, [farm])
  // const loginUser = async (userId) => {
  //   try {
  //     const response = await axios.post(`https://pokegram.games/user/${userId}/login`);
  //     console.log(response);
  //   } catch (error) {
  //     console.error('Failed to log in user:', error);
  //   }
  // };
  const claimCoin = async () => {
    try {
      const userId = user.userId;
      const response = await axios.post(`https://pokegram.games/user/${userId}/claim`, { farm });
      console.log('Updated user:', response.data);

      // Reset farm to 0 after claiming
      setFarm(0);
      const res = axios.post(`https://pokegram.games/user/${userId}/logout`, { farm: 0 });

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
      const userId = user?.id;
      if (user) {
        if (!isValidTonWallet(tonWallet)) {
          alert("Ton wallet loi")
          return;
        }
        if (idTwitter == "") {
          alert("vui long nhap twId")
        }
        else {
          axios.post(`https://pokegram.games/user/${userId}`, {
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
  //Farm
  useEffect(() => {
    if (user) {
      axios.get(`https://pokegram.games/rank/${user?.rank}`)
        .then(
          response => {
            const intervalId = setInterval(() => {
              setFarm(prevFarm => prevFarm + (user?.farmSpeed * response.data.rank_buff / 60))
            }, 1000);

            // Xóa bỏ interval khi component được unmount
            return () => clearInterval(intervalId);
          }
        )

    }

  }, [user]);
  const levelUp = async () => {
    try {
      const userId = user?.userId;
      const response = await axios.post(`https://pokegram.games/user/${userId}/levelUp`);
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
      const response = await axios.post(`https://pokegram.games/user/${userId}/logout`, { farm });
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
