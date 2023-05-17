import './App.css';
import { useState, createContext } from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import { MainLayout } from './layouts/MainLayout.js'; 
import {MessagesLayout} from './layouts/MessagesLayout'
import { Home } from '../pages/Home';
import { Messages } from '../pages/Messages';
import { Settings } from '../pages/Settings';
import { LoginPage } from '../pages/LoginPage';

const LoggedInContext = createContext({
  isLoggedin: false,
  setIsLoggedIn: () => {},

  userdata: null,
  setUserdata: () => {}
})

/*
const LoggedInUser = createContext({
  userdata: null,
  setUserdata: () => {}
})
*/

function App() {
  const [isLoggedin, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const loggedInValueAndSetter = [isLoggedin, setIsLoggedIn, userData, setUserData];

  return (
    <div className='App'>
    <LoggedInContext.Provider value={loggedInValueAndSetter}>
      <Routes>
        <Route path="/" element={ <MainLayout/>}>
          <Route index element={ <Home /> } />
          <Route path="/login" element={ <LoginPage/> } />
          <Route path="/messages" element={ <MessagesLayout/>} />
          <Route path="/settings" element={ <Settings/> } />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </LoggedInContext.Provider>
    </div>
  );
}

export default App;
export {LoggedInContext}
