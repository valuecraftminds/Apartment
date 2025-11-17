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
import ViewHouse from './FloorsHouse/ViewHouse'
import Bills from './Bills/Bills'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import CompleteRegistration from './Users/CompleteRegistration'
import ManageBills from './Bills/ManageBills'
import BillsAndCalculations from './Bills/BillsAndCalculations'
import BillRange from './Bills/BillRange'
import BillPrice from './Bills/BillPrice'
import OwnerDashboard from './Apartment_Owner/OwnerPages/OwnerDashboard'
import ManagerDashboard from './Apartment_Manager/ManagerPages/ManagerDashboard'
import TechDashboard from './Apartment_Technician/TechPages/TechDashboard'
import Role from './pages/Role'
import EmployeeDashboard from './pages/EmployeeDashboard'
import { AuthProvider } from './contexts/AuthContext'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path='/login' element={<Login />} />
        {/* <Route path='/companyregistration' element={<CompanyRegistration />}/> */}
        <Route path='/register' element={<Register />}/>
        <Route path='/verify' element={<Verify />}/>
        <Route path='/sidebar' element={<Sidebar/>}/>
        <Route path='/navbar' element={<NavBar />}/>
        <Route path='/admindashboard' element={<AdminDashboard />}/>
        <Route path='/apartmentview' element={<ApartmentView/>}/>
        <Route path='/userview' element={<UserView/>}/>
        <Route path='/floors/:id' element={<Floors/>}/>
        <Route path='/houses/:apartment_id/:floor_id' element={<Houses/>}/>
        <Route path='/housetype/:apartment_id' element={<HouseTypes/>}/>
        <Route path='/viewhouse/:apartment_id/:floor_id/:id' element={<ViewHouse/>}/>
        <Route path='/bills/:apartment_id' element={<Bills/>}/>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path='/complete-registration' element={<CompleteRegistration/>}/>
        <Route path='/manage-bills' element={<ManageBills/>}/>
        <Route path='/bills-and-calculations' element={<BillsAndCalculations/>}/>
        <Route path="/billranges/:bill_id" element={<BillRange />} />
        <Route path="/billprice/:bill_id/:billrange_id" element={<BillPrice />} />        
        {/* <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/technician-dashboard" element={<TechDashboard/>} /> */}
        <Route path='/employee-dashboard' element={<EmployeeDashboard/>}/>
        <Route path='/role' element={<Role/>}/>
        <Route path='/profile-page' element={<ProfilePage/>}/>
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
