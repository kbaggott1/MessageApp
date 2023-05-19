import './App.css';
import { useState, createContext, useEffect } from 'react';
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { MainLayout } from './layouts/MainLayout.js'; 
import {MessagesLayout} from './layouts/MessagesLayout'
import { Home } from '../pages/Home';
import { Settings } from '../pages/Settings';
import { LoginPage } from '../pages/LoginPage';
import { Register } from '../pages/Register';
import {useCookies} from 'react-cookie';

//Context that stores a boolean indicating if a user is logged in or not
const LoggedInContext = createContext({
  isLoggedin: false,
  setIsLoggedIn: () => {},
})

//Context containing the user data of the user currently logged in
const LoggedInUserContext = createContext({
  userdata: {},
  setUserData: () => {}
})

//Context containg chat data of the use currently logged in
const ChatContext = createContext({
  selectedChat: {},
  setSelectedChat: () => {},
})

function App() {
  const [isLoggedin, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState({});
  const [selectedChat, setSelectedChat] = useState({});
  const navigate = useNavigate();
  const [cookies, setCookie, removeCookie] = useCookies(['username']);

  const loggedInValueAndSetter = [isLoggedin, setIsLoggedIn];
  const userDataGetterAndSetter = [userData, setUserData];
  const chatGetterAndSetter =[selectedChat, setSelectedChat]

  useEffect(() => {
    async function checkForLoggedIn() {
      try {
        /** Call auth, passing cookies to the back-end */
        const response = await fetch("http://localhost:1337/session/auth", { method: "GET", credentials: "include" });
        if (response.status === 200) {
          setIsLoggedIn(true);
          setUserData(await loginAs(cookies.username));
          console.log(userData);
        } else {
          setIsLoggedIn(false); // may be unnecessary, but do this just in case to be more secure
          removeCookie('username');
          navigate("/");
        }
      } catch (error) {
        setIsLoggedIn(false);
      }
    }
    checkForLoggedIn();
  }, []);


  return (
    <div className='App'>
            <ChatContext.Provider value={chatGetterAndSetter} >
          <LoggedInUserContext.Provider value={userDataGetterAndSetter}>
        <LoggedInContext.Provider value={loggedInValueAndSetter}>
      <Routes>
    <Route path="/" element={ <MainLayout/>}>
  <Route index element={ <Home /> } />
  <Route path="/login" element={ <LoginPage/> } />
  <Route path="/messages" element={ <MessagesLayout/>} />
  <Route path="/settings" element={ <Settings/> } />
  <Route path="/register" element={<Register />} />
  <Route path="*" element={<Navigate to="/" />} />
    </Route>
      </Routes>
        </LoggedInContext.Provider>
          </LoggedInUserContext.Provider>
            </ChatContext.Provider>
    </div>
  );
}

export default App;
export {LoggedInContext, LoggedInUserContext, ChatContext}


async function loginAs(username) {
  try {
    const requestOptions = {
    method: "GET",
    credentials: "include",
    mode: 'cors', // this cannot be 'no-cors'
    };
    const response = await fetch("http://localhost:1337/users/"+ username, requestOptions);
    const result = await response.json();
    console.log(result);
    return result;
  }
  catch(err) {
    alert("Could not get user: " +username + " Error: " + err.message);
  }
}