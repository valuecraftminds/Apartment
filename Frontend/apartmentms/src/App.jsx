import { useState } from 'react'
import React from 'react'
import { BrowserRouter,Route,Routes } from 'react-router-dom'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Register from './pages/Register'
import Verify from './pages/Verify'
import AdminDashboard from './pages/AdminDashboard'
import NavBar from './components/Navbar'
import CompanyRegistration from './pages/CompanyRegistration'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path='/login' element={<Login />} />
        <Route path='/companyregistration' element={<CompanyRegistration />}/>
        <Route path='/admin/register' element={<Register />}/>
        {/* <Route path='/verify' element={<Verify />}/> */}
        <Route path='/navbar' element={<NavBar />}/>
        <Route path='/admindashboard' element={<AdminDashboard />}/>
      </Routes>
    </BrowserRouter>
  )
}
