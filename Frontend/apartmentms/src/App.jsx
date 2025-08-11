import { useState } from 'react'
import React from 'react'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import Welcome from './pages/Welcome'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* This will match "/" */}
        <Route path="/" element={<Welcome />} />
      </Routes>
    </BrowserRouter>
  )
}
