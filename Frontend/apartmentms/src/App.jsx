import { useState } from 'react'
import React from 'react'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Register from './pages/Register'
import Verify from './pages/Verify'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* This will match "/" */}
        <Route path="/" element={<Welcome />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />}/>
        <Route path='/verify' element={<Verify />}/>
      </Routes>
    </BrowserRouter>
  )
}
