import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Login from './components/Login.js';
import Signup from './components/Signup.js';
import Upload from './components/Upload.js';
import Chatting from './components/Chatting.js';

const App = () => {
  return (
    <div>
      {/* <UserUpload/>
      <Qans/> */}
      <Routes>
        <Route path='/upload' element={<Upload/>} />
        <Route path='/qans' element={<Chatting/>}/>
        <Route path='/' element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
      </Routes>
    </div>
  )
}

export default App