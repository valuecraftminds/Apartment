import React, { useState, useEffect, useRef } from 'react'
import { Loader, ArrowLeft, FileText, Camera, QrCode } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import api from '../../api/axios'
import { Html5QrcodeScanner } from 'html5-qrcode'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import { useNavigate } from 'react-router-dom'

export default function MeasurableBills() {
    const [scanning, setScanning] = useState(false)
    const [scannedData, setScannedData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [measurableBills, setMeasurableBills] = useState([])
    const scannerRef = useRef(null)
    const navigate = useNavigate();

    // Initialize QR Scanner
    const startScanning = () => {
        setScanning(true)
        setScannedData(null)
        setMeasurableBills([])

        setTimeout(() => {
            try {
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
                        console.log('QR Scan error:', error)
                    }
                )
            } catch (error) {
                console.error('Scanner initialization error:', error)
                toast.error('Failed to initialize scanner. Please refresh and try again.')
            }
        }, 100)
    }

    // Handle successful scan - UPDATED for new QR structure
    const handleScanSuccess = async (decodedText) => {
        try {
            setLoading(true)
            
            if (scannerRef.current) {
                await scannerRef.current.clear()
            }
            setScanning(false)

            const data = JSON.parse(decodedText)
            
            // Validate required fields for NEW structure
            if (!data.h_id && !data.house_id) {
                toast.error('Invalid QR code: Missing house ID')
                return
            }

            setScannedData(data)
            await fetchMeasurableBills(data)

        } catch (error) {
            console.error('Error processing QR code:', error)
            toast.error('Invalid QR code format. Please scan a valid house QR code.')
            setScanning(false)
        } finally {
            setLoading(false)
        }
    }

    // In fetchMeasurableBills function:
    const fetchMeasurableBills = async (qrData) => {
        try {
            setLoading(true)

            // Use the IDs from QR code to fetch fresh data
            const houseDbId = qrData.house_db_id
            const apartmentId = qrData.apt_id || qrData.apartment_db_id
            const floorDbId = qrData.f_id || qrData.floor_db_id

            if (!houseDbId || !apartmentId || !floorDbId) {
                toast.error('Missing house or apartment ID or floor ID in QR code')
                return
            }

            const billsRes = await api.get(
                `/bill-assignments/house-details?house_id=${houseDbId}&floor_id=${floorDbId}&apartment_id=${apartmentId}`
            )

            // Filter measurable bills
            if (billsRes.data.success && Array.isArray(billsRes.data.data)) {
                const measurable = billsRes.data.data
                    .filter(bill => bill.billtype === 'Measurable' && bill.bill_name?.trim())
                    .map(bill => ({
                        ...bill,
                        // Ensure we have the actual bill_id
                        actual_bill_id: bill.bill_id, // This is the actual bill ID
                        assignment_id: bill.id // This is the assignment ID
                    }))
                
                setMeasurableBills(measurable)
                
                if (measurable.length === 0) {
                    toast.info('No measurable bills found for this house')
                } else {
                    toast.success(`Found ${measurable.length} measurable bill(s)`)
                }
            } else {
                setMeasurableBills([])
                toast.info('No bills assigned to this house')
            }

        } catch (error) {
            console.error('Error fetching bill details:', error)
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

    // Helper function to get display values from QR data (supports both old and new structures)
    const getDisplayValue = (qrData) => {
        return {
            // House ID - support both old and new structures
            houseId: qrData.h_id || qrData.house_id,
            
            // Apartment - support both old and new structures
            apartment: qrData.apt || qrData.apartment,
            
            // Floor - support both old and new structures
            floor: qrData.fl || qrData.floor,
            
            // Status - support both old and new structures
            status: qrData.st || qrData.status,
            
            // House Type - support both old and new structures
            houseType: qrData.ht || qrData.house_type,
            
            // Owner Name - support both old and new structures
            ownerName: qrData.own || qrData.owner_name,
            
            // Owner NIC - support both old and new structures
            ownerNic: qrData.nic || qrData.owner_nic,
            
            // Square Feet - support both old and new structures
            squareFeet: qrData.sqf || qrData.square_feet,
            
            // Rooms - support both old and new structures
            rooms: qrData.rms || qrData.rooms,
            
            // Bathrooms - support both old and new structures
            bathrooms: qrData.bth || qrData.bathrooms
        }
    }

    const handleCalculateBill = (bill) => {
    console.log('DEBUG: Bill object passed to calculate:', bill)
    
    // Check if bill has both id and bill_id
    const billId = bill.bill_id || bill.id
    
    navigate(`/calculate-measurable-bill/${billId}`, {
        state: {
            scannedData: scannedData,
            billData: bill,
            // Pass both IDs to be safe
            billAssignmentId: bill.id, // This is the assignment ID
            actualBillId: bill.bill_id || bill.id // This should be the actual bill ID
        }
    });
};

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Navbar at the top */}
            <Navbar />
            
            <div className="flex">
                {/* Sidebar on the left */}
                <Sidebar />
                
                {/* Main content */}
                <div className="flex-1 p-4"> {/* ml-16 to account for sidebar width */}
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
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
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700  text-gray-700 dark:text-gray-100 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                                    >
                                        <ArrowLeft size={16} />
                                        <span>Cancel</span>
                                    </button>
                                </div>

                                <div className="relative">
                                    <div id="qr-reader" className="rounded-lg overflow-hidden border-2 border-purple-500 text-gray-700 dark:text-gray-100"></div>
                                    
                                    <div className="absolute top-4 left-4 right-4 text-center z-10">
                                        <div className="inline-block bg-black/70 text-white  px-3 py-1 rounded-full text-sm">
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
                                        className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
                                                        {getDisplayValue(scannedData).houseId}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Apartment:</span>
                                                    <span className="font-medium text-gray-800 dark:text-white">
                                                        {getDisplayValue(scannedData).apartment}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Floor:</span>
                                                    <span className="font-medium text-gray-800 dark:text-white">
                                                        {getDisplayValue(scannedData).floor || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                                    <span className="font-medium text-gray-800 dark:text-white">
                                                        {getDisplayValue(scannedData).status || 'N/A'}
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
                                                        {getDisplayValue(scannedData).houseType || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Square Feet:</span>
                                                    <span className="font-medium text-gray-800 dark:text-white">
                                                        {getDisplayValue(scannedData).squareFeet || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Rooms:</span>
                                                    <span className="font-medium text-gray-800 dark:text-white">
                                                        {getDisplayValue(scannedData).rooms || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Bathrooms:</span>
                                                    <span className="font-medium text-gray-800 dark:text-white">
                                                        {getDisplayValue(scannedData).bathrooms || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Owner Information */}
                                {getDisplayValue(scannedData).ownerName && getDisplayValue(scannedData).ownerName !== "No Owner Assigned" && (
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                                        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                                            Owner Information
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Name:</span>
                                                <span className="font-medium text-gray-800 dark:text-white">
                                                    {getDisplayValue(scannedData).ownerName}
                                                </span>
                                            </div>
                                            {getDisplayValue(scannedData).ownerNic && getDisplayValue(scannedData).ownerNic !== "N/A" && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">NIC:</span>
                                                    <span className="font-medium text-gray-800 dark:text-white">
                                                        {getDisplayValue(scannedData).ownerNic}
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
                                                            <span className="font-medium">{bill.billtype}</span>
                                                        </div>
                                                    </div>
                                                    <div className='items-center'>
                                                        <button 
                                                            onClick={() => handleCalculateBill(bill)}
                                                            className='px-2 py-1 mt-3 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'
                                                        >
                                                            Calculate
                                                        </button>
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
            </div>
            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    )
}