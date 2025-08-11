import { useState } from 'react'
import React from 'react'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Login from './LoginRegistration/Login'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* This will match "/" */}
        <Route path="/" element={<Welcome />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}
