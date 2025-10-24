import React from 'react'

export default function BillRange() {
    const [loadingBills,setLoadingBills] = useState(false);
    const [error, setError] = useState(null);
    const [billRange,setBillRange] = useState([]);

  return (
    <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 text-gray-700 dark:text-gray-300'>
        <button 
        onClick={handleAddNew}
        className='flex items-center gap-2 mb-3 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
            <Plus size={20} />
            <span>New Bill Range</span>
        </button>
        {loadingBills ? (
            <div className="flex justify-center items-center py-12">
                <Loader size={32} className="animate-spin text-purple-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading Bill types...</span>
            </div>
            ) : error ? (
            <div className="text-center py-12 text-red-600 dark:text-red-400">
                {error}
                <button
                    onClick={loadingBills}
                    className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                    Retry
                </button>
            </div>
            ) : bills.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-300">
                <Image size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg">No bill types found</p>
                <p className="text-sm">Get started by adding bill types</p>
            </div>
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {bills.map((bills,index) => (
                            <tr key={bills.id}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {index + 1}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {bills.bill_name}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(bills);
                                            }}
                                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                            title="Edit"
                                            >
                                            <Edit size={20} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(bills);
                                            }}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                            title="Delete"
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
