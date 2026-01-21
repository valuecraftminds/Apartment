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
import MyApartments from './Users/MyApartments'
import SharedValueBillPrice from './Bills/SharedValueBillPrice'
import BillPayments from './Bills/BillPayments'
import MeasurableBills from './Apartment_Technician/BillManagement/MeasurableBills'
import CalculateMeasurableBill from './Apartment_Technician/BillManagement/CalculateMeasurableBill'
import MyBills from './Users/MyBills'
import HouseBillMeter from './Apartment_Technician/BillManagement/HouseBillMeter'
import BillPaymentSettle from './Bills/BillPaymentSettle'
import HouseOwnerLogin from './HouseOwner/HouseOwnerLogin'
import HouseOwnerDashboard from './pages/HouseOwnerDashboard'
import HouseOwnerVerify from './HouseOwner/HouseOwnerVerify'
import HouseOwnerHouseView from './HouseOwner/HouseOwnerHouseView'
import HouseOwnerViewBills from './HouseOwner/HouseOwnerViewBills'
import HouseOwnerComplaints from './HouseOwner/HouseOwnerComplaint'
import ViewComplaint from './Apartment_Technician/ComplaintManagament/ViewComplaint'
import MyComplaints from './Users/MyComplaints'
import HouseOwnerProfilePage from './HouseOwner/HouseOwnerProfilePage'
import StartWork from './Apartment_Technician/ComplaintManagament/StartWork'

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
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path='/complete-registration' element={<CompleteRegistration/>}/>
        <Route path='/manage-bills' element={<ManageBills/>}/>
        <Route path='/bills-and-calculations' element={<BillsAndCalculations/>}/>
        <Route path="/billranges/:bill_id" element={<BillRange />} />
        <Route path="/billprice/:bill_id/:billrange_id" element={<BillPrice />} />        
        {/* <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/tech-dashboard" element={<TechDashboard/>} /> */}
        <Route path='/employee-dashboard' element={<EmployeeDashboard/>}/>
        <Route path='/role' element={<Role/>}/>
        <Route path='/profile-page' element={<ProfilePage/>}/>
        <Route path='/my-apartments' element={<MyApartments/>}/>
        <Route path='/shared-value-bill-prices/:bill_id' element={<SharedValueBillPrice/>}/>
        <Route path='/bill-payments' element={<BillPayments/>}/>
        <Route path='/measurable-bills' element={<MeasurableBills/>}/>
        <Route path='/calculate-measurable-bill/:bill_id' element={<CalculateMeasurableBill/>}/>
        <Route path='/my-bills' element={<MyBills/>}/>
        <Route path='/house-bill-meter/:bill_id' element={<HouseBillMeter/>}/>
        <Route path='/bill-payment-settle' element={<BillPaymentSettle/>}/>
        <Route path='/houseowner/login' element= {<HouseOwnerLogin/>}/>
        <Route path='/houseowner/verify' element= {<HouseOwnerVerify/>}/>
        <Route path='/houseowner/dashboard' element= {<HouseOwnerDashboard/>}/>
        <Route path='/houseowner/houseowner-houseview' element= {<HouseOwnerHouseView/>}/>
        <Route path='/houseowner/houseowner-billview' element= {<HouseOwnerViewBills/>}/>
        <Route path='/houseowner/complaints' element= {<HouseOwnerComplaints/>}/>
        <Route path="/houseowner/houseowner-profile" element={<HouseOwnerProfilePage />} />
        <Route path='/view-complaints' element= {<ViewComplaint/>}/>
        <Route path='/my-complaints' element= {<MyComplaints/>}/>
        <Route path= '/start-work/:complaintId' element={<StartWork />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
