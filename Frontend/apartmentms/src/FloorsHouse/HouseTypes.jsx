import React from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar';
import { Building, ChevronLeft, Plus } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function HouseTypes() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const {apartment_id,floor_id} = useParams();
    console.log('Apartment ID:', apartment_id);
    console.log('Floor Id:',floor_id);
    const [apartment, setApartment] = useState(null);
    const [floor,setFloor] = useState(null);

  return (
        <div className='flex-1 overflow-y-auto p-6'>
                <div className='mx-auto max-w-7xl'>
                    <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6'>
                            <button className='flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
                                <Plus size={20}/>
                                <span>Add New</span>
                            </button>
                    </div>
                </div>
            </div>
  )
}
