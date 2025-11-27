// import React, { useState, useEffect, useContext } from 'react';
// import api from '../../api/axios';
// import Sidebar from '../../components/Sidebar';
// import Navbar from '../../components/Navbar';
// import { AuthContext } from '../../contexts/AuthContext';
// import { useNavigate } from 'react-router-dom';

// export default function MeasurableBills() {
//     const [loadingBills, setLoadingBills] = useState(false);
//     const [error, setError] = useState(null);
//     const [bills, setBills] = useState([]);
//     const { auth } = useContext(AuthContext);
//     const navigate = useNavigate();

//     // Load all bills
//     const loadBills = async () => {
//         try {
//             setLoadingBills(true);
//             setError(null);
//             const result = await api.get('/bills');
            
//             // Corrected data structure based on your backend
//             if (result.data.success && Array.isArray(result.data.data)) {
//                 setBills(result.data.data);
//             } else {
//                 setBills([]);
//             }
//         } catch (err) {
//             console.error('Error loading bills:', err);
//             setError('Failed to load bills. Please try again.');
//         } finally {
//             setLoadingBills(false);
//         }
//     };

//     useEffect(() => {
//         loadBills();
//     }, []);

//     // Filter bills - Only show Measurable bills
//     const measurableBills = bills.filter(bill => bill.billtype === 'Measurable');

//     // Loading state
//     if (loadingBills) {
//         return (
//             <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
//                 <Sidebar />
//                 <div className="flex-1 flex flex-col lg:ml-0">
//                     <Navbar />
//                     <div className="flex-1 flex items-center justify-center p-4">
//                         <div className="text-center">
//                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500 mx-auto"></div>
//                             <p className="mt-4 text-gray-600 dark:text-gray-400">Loading bills...</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     // Error state
//     if (error) {
//         return (
//             <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
//                 <Sidebar />
//                 <div className="flex-1 flex flex-col lg:ml-0">
//                     <Navbar />
//                     <div className="flex-1 flex items-center justify-center p-4">
//                         <div className="text-center">
//                             <div className="text-red-500 text-lg mb-2">⚠️</div>
//                             <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
//                             <button
//                                 onClick={loadBills}
//                                 className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
//                             >
//                                 Try Again
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
//             {/* Sidebar */}
//             <Sidebar />
            
//             {/* Main Content Area */}
//             <div className="flex-1 flex flex-col lg:ml-0">
//                 {/* Navbar */}
//                 <Navbar />
                
//                 {/* Page Content */}
//                 <main className="flex-1 p-6 ml-16">
//                     {/* Header */}
//                     <div className="mb-6">
//                         <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Measurable Bills</h1>
//                         <p className="text-gray-600 dark:text-gray-400 mt-1">
//                             {measurableBills.length} bill{measurableBills.length !== 1 ? 's' : ''} found
//                         </p>
//                     </div>

//                     {/* Bills List */}
//                     {measurableBills.length === 0 ? (
//                         <div className="text-center py-12">
//                             <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">📄</div>
//                             <p className="text-gray-500 dark:text-gray-400 text-lg">No measurable bills found</p>
//                             <p className="text-gray-400 dark:text-gray-500 mt-1">
//                                 {bills.length > 0 
//                                     ? `${bills.length} bills loaded but none are marked as measurable.` 
//                                     : 'No bills available.'
//                                 }
//                             </p>
//                         </div>
//                     ) : (
//                         <div className="space-y-4">
//                             {measurableBills.map((bill) => (
//                                 <div
//                                     key={bill.id}
//                                     className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
//                                 >
//                                     {/* Bill Header */}
//                                     <div className="flex justify-between items-start mb-3">
//                                         <div className="flex-1">
//                                             <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
//                                                 {bill.bill_name || 'Unnamed Bill'}
//                                             </h3>
//                                         </div>
//                                     </div>

//                                     {/* Bill Details */}
//                                     <div className="grid grid-cols-2 gap-4 text-sm mb-3">
//                                         <div>
//                                             <p className="text-gray-500 dark:text-gray-400">Company ID</p>
//                                             <p className="font-semibold text-gray-900 dark:text-white">
//                                                 {bill.company_id}
//                                             </p>
//                                         </div>
//                                         <div>
//                                             <p className="text-gray-500 dark:text-gray-400">Type</p>
//                                             <p className="font-medium text-blue-600 dark:text-blue-400">
//                                                 {bill.billtype}
//                                             </p>
//                                         </div>
//                                     </div>

//                                     {/* Additional Info */}
//                                     <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
//                                         <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
//                                             <span>Metered: {bill.is_metered ? 'Yes' : 'No'}</span>
//                                             <span>
//                                                 Created: {bill.created_at ? new Date(bill.created_at).toLocaleDateString() : 'N/A'}
//                                             </span>
//                                         </div>
//                                     </div>

//                                     {/* Action Buttons */}
//                                     <div className="mt-4 flex space-x-2">
//                                         <button 
//                                             className="flex-1 bg-purple-700 dark:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
//                                             onClick={() => navigate(`/calculate-measurable-bill/${bill.id}`)}
//                                         >
//                                             Calculate
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}

//                     {/* Refresh Button */}
//                     <div className="fixed bottom-6 right-6 z-40">
//                         <button
//                             onClick={loadBills}
//                             className="bg-blue-600 dark:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
//                         >
//                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                             </svg>
//                         </button>
//                     </div>
//                 </main>
//             </div>
//         </div>
//     );
// }

import React, { useState, useEffect, useRef } from 'react'
import { Loader, ArrowLeft, FileText, Camera, QrCode } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import { Html5QrcodeScanner } from 'html5-qrcode'
import Sidebar from '../../components/Sidebar'

export default function MeasurableBills() {
    const [scanning, setScanning] = useState(false)
    const [scannedData, setScannedData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [measurableBills, setMeasurableBills] = useState([])
    const scannerRef = useRef(null)

    // Initialize QR Scanner
    const startScanning = () => {
        setScanning(true)
        setScannedData(null)
        setMeasurableBills([])

        // Give DOM time to update
        setTimeout(() => {
            try {
                // Clear any existing scanner
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(error => {
                        console.log('Scanner clear error:', error)
                    })
                }

                scannerRef.current = new Html5QrcodeScanner(
                    "qr-reader",
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    },
                    false
                )

                scannerRef.current.render(
                    (decodedText) => {
                        handleScanSuccess(decodedText)
                    },
                    (error) => {
                        // Optional: Handle scan errors quietly
                        console.log('QR Scan error:', error)
                    }
                )
            } catch (error) {
                console.error('Scanner initialization error:', error)
                toast.error('Failed to initialize scanner. Please refresh and try again.')
            }
        }, 100)
    }

    // Handle successful scan
    const handleScanSuccess = async (decodedText) => {
        try {
            setLoading(true)
            
            // Stop scanner
            if (scannerRef.current) {
                await scannerRef.current.clear()
            }
            setScanning(false)

            const data = JSON.parse(decodedText)
            
            // Validate required fields
            if (!data.house_id || !data.apartment) {
                toast.error('Invalid QR code: Missing required data')
                return
            }

            setScannedData(data)
            await fetchHouseDetails(data)

        } catch (error) {
            console.error('Error processing QR code:', error)
            toast.error('Invalid QR code format. Please scan a valid house QR code.')
            setScanning(false)
        } finally {
            setLoading(false)
        }
    }

    // Fetch fresh house details and measurable bills
    const fetchHouseDetails = async (qrData) => {
        try {
            setLoading(true)

            // Since the QR code contains all the data we need for display,
            // we only need to fetch the bills to filter measurable ones
            const billsRes = await api.get(
                `/bill-assignments/house-details?house_id=${qrData.house_db_id || qrData.house_id}&apartment_id=${qrData.apartment_db_id}`
            )

            // Filter measurable bills
            if (billsRes.data.success && Array.isArray(billsRes.data.data)) {
                const measurable = billsRes.data.data.filter(bill => 
                    bill.billtype === 'Measurable' && bill.bill_name?.trim()
                )
                setMeasurableBills(measurable)
                
                if (measurable.length === 0) {
                    toast.info('No measurable bills found for this house')
                } else {
                    toast.success(`Found ${measurable.length} measurable bill(s)`)
                }
            } else {
                setMeasurableBills([])
            }

        } catch (error) {
            console.error('Error fetching house details:', error)
            if (error.response?.status === 404) {
                toast.error('House not found in the system')
            } else {
                toast.error('Failed to load bill details')
            }
            setMeasurableBills([])
        } finally {
            setLoading(false)
        }
    }

    // Reset and clean up
    const handleReset = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(error => {
                console.log('Scanner clear error on reset:', error)
            })
        }
        setScanning(false)
        setScannedData(null)
        setMeasurableBills([])
    }

    // Clean up on component unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.log('Scanner clear error on unmount:', error)
                })
            }
        }
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <Sidebar />
            {/* Header */}
            <div className="ml-16 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        {/* <QrCode className="text-purple-600" /> */}
                        Scan House QR Code
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        Scan a house QR code to view measurable bills
                    </p>
                </div>

                {/* Scanning Interface */}
                {scanning && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                Scanner
                            </h2>
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                <ArrowLeft size={16} />
                                <span>Cancel</span>
                            </button>
                        </div>

                        <div className="relative">
                            <div id="qr-reader" className="rounded-lg overflow-hidden border-2 border-purple-500"></div>
                            
                            {/* Scanner overlay instructions */}
                            <div className="absolute top-4 left-4 right-4 text-center z-10">
                                <div className="inline-block bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                    Position QR code within frame
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            <p>Point your camera at a house QR code to scan</p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                        <Loader size={32} className="animate-spin mx-auto text-purple-600 mb-4" />
                        <p className="text-gray-600 dark:text-gray-300">Loading house details...</p>
                    </div>
                )}

                {/* Scanned Results */}
                {scannedData && !loading && !scanning && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                    House Details
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Scanned information from QR code
                                </p>
                            </div>
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                <ArrowLeft size={16} />
                                <span>Scan Another</span>
                            </button>
                        </div>

                        {/* House Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                                        Basic Information
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">House ID:</span>
                                            <span className="font-medium text-gray-800 dark:text-white">
                                                {scannedData.house_id}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Apartment:</span>
                                            <span className="font-medium text-gray-800 dark:text-white">
                                                {scannedData.apartment}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Floor:</span>
                                            <span className="font-medium text-gray-800 dark:text-white">
                                                {scannedData.floor || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                            <span className="font-medium text-gray-800 dark:text-white">
                                                {scannedData.status || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                                        House Details
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                            <span className="font-medium text-gray-800 dark:text-white">
                                                {scannedData.house_type || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Square Feet:</span>
                                            <span className="font-medium text-gray-800 dark:text-white">
                                                {scannedData.square_feet || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Rooms:</span>
                                            <span className="font-medium text-gray-800 dark:text-white">
                                                {scannedData.rooms || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Bathrooms:</span>
                                            <span className="font-medium text-gray-800 dark:text-white">
                                                {scannedData.bathrooms || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Owner Information */}
                        {scannedData.owner_name && scannedData.owner_name !== "No Owner Assigned" && (
                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                                    Owner Information
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Name:</span>
                                        <span className="font-medium text-gray-800 dark:text-white">
                                            {scannedData.owner_name}
                                        </span>
                                    </div>
                                    {scannedData.owner_nic && scannedData.owner_nic !== "N/A" && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">NIC:</span>
                                            <span className="font-medium text-gray-800 dark:text-white">
                                                {scannedData.owner_nic}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Measurable Bills Section */}
                        <div className="border-t dark:border-gray-600 pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-green-600" />
                                Measurable Bills ({measurableBills.length})
                            </h3>

                            {measurableBills.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {measurableBills.map((bill, index) => (
                                        <div
                                            key={index}
                                            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText size={16} className="text-green-600" />
                                                <h4 className="font-semibold text-gray-800 dark:text-white">
                                                    {bill.bill_name}
                                                </h4>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Type:</span>
                                                    <span className="font-medium">{bill.mbilltype}</span>
                                                </div>
                                                {bill.amount && (
                                                    <div className="flex justify-between">
                                                        <span>Amount:</span>
                                                        <span className="font-medium">LKR {bill.amount}</span>
                                                    </div>
                                                )}
                                                {bill.due_date && (
                                                    <div className="flex justify-between">
                                                        <span>Due Date:</span>
                                                        <span className="font-medium">
                                                            {new Date(bill.due_date).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
                                    <FileText size={32} className="mx-auto text-yellow-600 mb-2" />
                                    <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                                        No measurable bills assigned to this house
                                    </p>
                                    <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
                                        All assigned bills are of non-measurable type
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Start Scanning Button */}
                {!scannedData && !scanning && !loading && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                        <QrCode size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                            Ready to Scan
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Click the button below to start scanning house QR codes
                        </p>
                        <button
                            onClick={startScanning}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 mx-auto"
                        >
                            <Camera size={20} />
                            Start Scanning
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
