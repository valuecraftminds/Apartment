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
import { House, Sidebar } from 'lucide-react'
import ApartmentView from './pages/ApartmentView'
import UserView from './pages/UserView'
import Layout from './pages/Layout'
import Floors from './FloorsHouse/Floors'
import Houses from './FloorsHouse/Houses'
import HouseTypes from './FloorsHouse/HouseTypes'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path='/login' element={<Login />} />
        {/* <Route path='/companyregistration' element={<CompanyRegistration />}/> */}
        <Route path='/register' element={<Register />}/>
        {/* <Route path='/verify' element={<Verify />}/> */}
        <Route path='/sidebar' element={<Sidebar/>}/>
        <Route path='/navbar' element={<NavBar />}/>
        <Route path='/admindashboard' element={<AdminDashboard />}/>
        <Route path='/apartmentview' element={<ApartmentView/>}/>
        <Route path='/userview' element={<UserView/>}/>
        <Route path='/floors/:id' element={<Floors/>}/>
        <Route path='/houses/:apartment_id/:floor_id' element={<Houses/>}/>
        <Route path='/housetype/:id' element={<HouseTypes/>}/>
      </Routes>
    </BrowserRouter>
  )
}
