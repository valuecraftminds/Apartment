import React from 'react'

export default function Houses() {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-2xl p-6'>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-gray-800 dark:text-white">
                                    Houses {selectedFloor ? `(Floor ${selectedFloor.floor_id})` : ''}
                                </h2>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md text-white bg-purple-600 hover:bg-purple-700">
                                    <Plus size={20} />
                                    <span>Add</span>
                                </button>
                            </div>
                            {loadingHouses ? (
                                    <div className="flex justify-center items-center py-12">
                                        <Loader size={32} className="animate-spin text-purple-600" />
                                        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading Houses...</span>
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-12 text-red-600 dark:text-red-400">
                                        {error}
                                        <button 
                                            onClick={loadFloors}
                                            className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                ) : houses.length === 0 ? (
                                    <div className="text-center py-12 text-gray-600 dark:text-gray-300">
                                        <Image size={48} className="mx-auto mb-4 text-gray-400" />
                                        <p className="text-lg">No houses found</p>
                                        <p className="text-sm">Get started by adding houses</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full table-auto">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">House No</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SQR Feet</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No of Rooms</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No of Bathrooms</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Occupied way</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Registered_at</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {houses.map((houses, index) => (
                                                    <tr 
                                                        key={houses.id} 
                                                    >
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {houses.house_id}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {houses.type}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {houses.sqrfeet}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {houses.rooms}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {houses.bathrooms}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {houses.status}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {houses.occupied_way}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {houses.registered_at}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                                    title="Edit"
                                                                >
                                                                    <Edit size={20} />
                                                                </button>
                                                                <button
                                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"    
                                                                >
                                                                    <Trash2 size={20} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                        </div>
  )
}
