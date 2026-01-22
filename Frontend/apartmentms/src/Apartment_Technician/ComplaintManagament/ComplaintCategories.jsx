import React, { useContext } from 'react'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar';
import { Loader, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ComplaintCategories() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [loadCategories, setLoadCategories] = useState(false);


  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <Sidebar onCollapse={setIsSidebarCollapsed}/>
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
            <Navbar/>
            <div className='flex-1 overflow-y-auto p-6'>
                <div className='mx-auto max-w-7xl'>
                    <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6'>
                        <div className='flex items-center'>
                            <Settings size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Service Category</h1>
                        </div>
                        <div className='flex gap-3'>
                            <button onClick={handleAddNew} className='flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
                                <Plus size={20}/>
                                <span>Add New</span>
                            </button>
                        </div>
                    </div>
                    <div className='bg-white dark:bg-gray-800 rounded-2xl p-6'>
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader size={32} className="animate-spin text-purple-600" />
                                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading service categories...</span>
                            </div>
                        ): error ? (
                            <div className="text-center py-12 text-red-600 dark:text-red-400">
                                {error}
                                <button 
                                    onClick={loadCategories}
                                    className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : categories.length === 0 ? (
                                <div className="text-center py-12 text-gray-600 dark:text-gray-300">
                                    <Image size={48} className="mx-auto mb-4 text-gray-400" />
                                    <p className="text-lg">No service categories found</p>
                                    <p className="text-sm">Get started by adding your first service category</p>
                                </div>
                        ) : (
                            <div className='overflow-x-auto'>
                                <table className='w-full table-auto'>
                                    <thead className='bg-gray-50 dark:bg-gray-700'>
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {categories.map(category => (
                                            <tr key={category.id}>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{category.name}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{category.description}</td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className='flex space-x-2'>

                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        )}

                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
