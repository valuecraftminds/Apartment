import React from 'react';
import { Outlet } from 'react-router-dom';
import HouseOwnerSidebar from './HouseOwnerSidebar';


export default function HouseOwnerLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <HouseOwnerSidebar />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-screen">
          <div className="p-4 md:p-6">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};


