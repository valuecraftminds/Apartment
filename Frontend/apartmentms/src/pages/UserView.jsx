import React, { useState } from 'react'
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Plus, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function UserView() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [users,setUsers] = useState();

  const loadUsers=async()=>{
      try{
        const result = await axios.get('/api/users')
      }catch(err){
        console.log("Error in fetching users");
        toast.error("Fetching users failure")
      }
    }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
          {/* Sidebar */}
          <Sidebar onCollapse={setIsSidebarCollapsed} />
          
          {/* Main Content Area - Dynamic margin based on sidebar state */}
          <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
            {/* Navbar */}
            <Navbar />
            
            {/* Page Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mx-auto max-w-7xl">
                {/* Header with title and button in flex row */}
                <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6'>
                  <div className='flex items-center'>
                    <Users size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Users</h1>
                  </div>
                  
                  <button className='flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
                    <Plus size={20}/>
                    <span>Add New</span>
                  </button>
                </div>
                
                {/* Rest of your user content will go here */}
                <div className='bg-white dark:bg-gray-800 rounded-2xl p-6'>
                  <table class="table-fixed">
  <thead>
    <tr>
      <th class="">First Name</th>
      <th class="">Last Name</th>
      <th class="">Username</th>
      <th class="">Country</th>
      <th class="">Mobile</th>
      <th class="">Email</th>
      <th class="">Role</th>
      <th class="">Action</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Intro to CSS</td>
      <td>Adam</td>
      <td>858</td>
      <td>858</td>
      <td>858</td>
      <td>858</td>
      <td>858</td>
      <td>858</td>
    </tr>
  </tbody>
</table>
                </div>
              </div>
            </div>
          </div>
        </div>
  )
}
