import './App.css';
import { Route, Routes, Navigate } from "react-router-dom";
import { MainLayout } from './layouts/MainLayout.js'; 
import { Home } from '../pages/Home';
import { Messages } from '../pages/Messages';
import { Settings } from '../pages/Settings';

function App() {
  return (
    <div className='App'>
    <Routes>
      <Route path="/" element={ <MainLayout/>}>
        <Route index element={ <Home /> } />
        <Route path="/messages" element={ <Messages/>} /> {/*use outlet*/}
        <Route path="/settings" element={ <Settings/> } />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
    </div>
  );
}

export default App;
