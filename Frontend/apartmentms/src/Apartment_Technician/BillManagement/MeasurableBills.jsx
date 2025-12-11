// MeasurableBills.jsx
import React, { useState, useEffect, useRef, useContext } from 'react'
import { Loader, ArrowLeft, FileText, Camera, QrCode, AlertCircle, Check, X, Receipt } from 'lucide-react'
import { toast, ToastContainer } from 'react-toastify'
import api from '../../api/axios'
import { Html5QrcodeScanner } from 'html5-qrcode'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/Navbar'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthContext } from '../../contexts/AuthContext'

export default function MeasurableBills() {
    const { bill_id } = useParams();
    const [scanning, setScanning] = useState(false)
    const [scannedData, setScannedData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [selectedBill, setSelectedBill] = useState(null)
    const [userAssignedApartments, setUserAssignedApartments] = useState([])
    const [accessGranted, setAccessGranted] = useState(false)
    const [accessDeniedReason, setAccessDeniedReason] = useState('')
    const [houseDetails, setHouseDetails] = useState(null)
    const scannerRef = useRef(null)
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);

    // Fetch the specific bill details
    const fetchSelectedBill = async () => {
        try {
            if (!bill_id) return;
            
            const response = await api.get(`/user-bills/users/${auth.user.id}/bills`);
            if (response.data.success && Array.isArray(response.data.data)) {
                const bill = response.data.data.find(b => b.id === bill_id);
                if (bill) {
                    setSelectedBill(bill);
                } else {
                    toast.error('You are not assigned to this bill');
                    navigate('/my-bills');
                }
            }
        } catch (error) {
            console.error('Error fetching bill details:', error);
            toast.error('Error loading bill information');
        }
    };

    // Fetch user's assigned apartments
    const fetchUserApartments = async () => {
        try {
            const response = await api.get(`/user-apartments/users/${auth.user.id}/apartments`);
            if (response.data.success && Array.isArray(response.data.data)) {
                setUserAssignedApartments(response.data.data);
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching user apartments:', error);
            toast.error('Error loading your assigned apartments');
            return [];
        }
    };

    // Function to decode URL-based QR data
    const decodeQRData = (decodedText) => {
        try {
            // Check if it's a URL
            if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
                const url = new URL(decodedText);
                const encodedData = url.searchParams.get('d');
                
                if (!encodedData) {
                    throw new Error('Missing encoded data in URL');
                }
                
                // Decode base64
                const decodedBase64 = atob(encodedData);
                const parsedData = JSON.parse(decodedBase64);
                
                console.log('Decoded QR data:', parsedData);
                return parsedData;
            } 
            // Check if it's already JSON (for backward compatibility)
            else if (decodedText.startsWith('{')) {
                return JSON.parse(decodedText);
            }
            else {
                throw new Error('Invalid QR format');
            }
        } catch (error) {
            console.error('Error decoding QR data:', error);
            throw new Error('Failed to decode QR data. Please scan a valid QR code.');
        }
    }

    // Check if house belongs to user's assigned apartment AND has the selected bill
    const checkHouseAccess = async (qrData) => {
        try {
            console.log('QR Data for access check:', qrData);
            console.log('Selected Bill ID:', bill_id);
            
            // Extract IDs from QR data
            const houseDbId = qrData.hse || qrData.house_db_id;
            const apartmentId = qrData.apt;
            const floorId = qrData.flr;
            

            if (!houseDbId || !apartmentId || !floorId) {
                return {
                    access: false,
                    reason: 'Missing house, apartment, or floor ID in QR code'
                };
            }

            // Check 1: Verify the house exists and get its details
            const houseResponse = await api.get(`/houses/${houseDbId}`);
            if (!houseResponse.data.success) {
                return {
                    access: false,
                    reason: 'House not found in the system'
                };
            }

            const houseData = houseResponse.data.data;
            setHouseDetails(houseData);

            // Check 2: Verify house belongs to user's assigned apartment
            const userHasApartmentAccess = userAssignedApartments.some(
                apartment => apartment.id === houseData.apartment_id
            );

            if (!userHasApartmentAccess) {
                return {
                    access: false,
                    reason: `You are not assigned to apartment "${houseData.apartment?.name || apartmentId}"`
                };
            }

            // Check 3: Get bills assigned to this house
            const houseBillsResponse = await api.get(
                `/bill-assignments/house-details?house_id=${houseDbId}&apartment_id=${houseData.apartment_id}`
            );

            // Check if the selected bill is assigned to this house
            let billAssignedToHouse = false;
            if (houseBillsResponse.data.success && Array.isArray(houseBillsResponse.data.data)) {
                billAssignedToHouse = houseBillsResponse.data.data.some(
                    assignment => assignment.bill_id === bill_id
                );
            }

            if (!billAssignedToHouse) {
                return {
                    access: false,
                    reason: `This house does not have "${selectedBill?.bill_name || 'the selected bill'}" assigned`
                };
            }

            // Check 4: Verify the bill is measurable
            if (selectedBill?.billtype?.toLowerCase() !== 'measurable') {
                return {
                    access: false,
                    reason: `"${selectedBill?.bill_name || 'Selected bill'}" is not a measurable bill`
                };
            }

            return {
                access: true,
                houseData: houseData
            };

        } catch (error) {
            console.error('Error checking house access:', error);
            if (error.response?.status === 404) {
                return {
                    access: false,
                    reason: 'House not found in the system'
                };
            }
            return {
                access: false,
                reason: 'Error checking access permissions'
            };
        }
    };

    // Initialize QR Scanner
    const startScanning = () => {
        setScanning(true)
        setScannedData(null)
        setAccessGranted(false)
        setAccessDeniedReason('')

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

    // Handle successful scan
    const handleScanSuccess = async (decodedText) => {
        try {
            setLoading(true)
            
            if (scannerRef.current) {
                await scannerRef.current.clear()
            }
            setScanning(false)

            console.log('Scanned text:', decodedText);
            
            // Decode the QR data (handles both URL and JSON formats)
            const qrData = decodeQRData(decodedText);
            console.log('Decoded QR data:', qrData);
            
            setScannedData(qrData);

            // Load user data first
            await fetchUserApartments();

            // Check access permissions
            const accessResult = await checkHouseAccess(qrData);

            if (accessResult.access) {
                setAccessGranted(true);
                toast.success(`Access granted! You can calculate ${selectedBill?.bill_name} bill for this house.`);
            } else {
                setAccessGranted(false);
                setAccessDeniedReason(accessResult.reason || 'Access denied');
                toast.error(accessResult.reason || 'Access denied');
            }

        } catch (error) {
            console.error('Error processing QR code:', error);
            toast.error(error.message || 'Invalid QR code. Please scan a valid house QR code.');
            setScanning(false);
        } finally {
            setLoading(false);
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
        setAccessGranted(false)
        setAccessDeniedReason('')
        setHouseDetails(null)
    }

    // Go back to My Bills
    const handleBackToBills = () => {
        navigate('/my-bills');
    }

    // Navigate to calculate bill
    const handleCalculateBill = () => {
        navigate(`/calculate-measurable-bill/${bill_id}`, {
            state: {
                scannedData: scannedData,
                billData: selectedBill,
                actualBillId: bill_id,
                houseData: houseDetails
            }
        });
    };

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

    // Load data on component mount
    useEffect(() => {
        if (auth?.user?.id && bill_id) {
            fetchSelectedBill();
            fetchUserApartments();
        }
    }, [auth?.user?.id, bill_id]);

    // Helper function to get display values from decoded data
    const getDisplayValue = (qrData) => {
        return {
            houseId: qrData.h_id || qrData.hse || 'N/A',
            apartment: qrData.apt || 'N/A',
            floor: qrData.floor_number || qrData.flr || 'N/A',
        }
    }

    // Load floors for the apartment
    const loadFloors = async (apartment_id) => {
        try {
            const result = await api.get(`/floors?apartment_id=${apartment_id}`); 
            console.log('Floors API Response:', result.data);

            if (result.data.success && Array.isArray(result.data.data)) {
                setFloors(result.data.data);
            } else {
                setFloors([]);
            }
        } catch (err) {
            console.error('Error loading floors:', err);
            toast.error('Failed to load floors');
        }
    };

    // Fetch houses for a specific floor
    const fetchHouses = async (floor_id) => {
        try {
            const result = await api.get(`/houses?apartment_id=${apartment.id}&floor_id=${floor_id}`);
            if (result.data.success && Array.isArray(result.data.data)) {
                return result.data.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching houses:', error);
            toast.error('Error loading houses');
            return [];
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">            
            <div className="flex">
                <Sidebar />
                
                <div className="flex-1 p-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Header with Selected Bill Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                        <QrCode className="text-purple-600" />
                                        Scan House QR: {selectedBill?.bill_name || 'this bill'}
                                    </h1>
                                </div>
                                <button
                                    onClick={handleBackToBills}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    <span>Back to Bills</span>
                                </button>
                            </div>
                        </div>

                        {/* Scanning Interface */}
                        {scanning && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                        Scanner Active
                                    </h2>
                                    <button
                                        onClick={handleReset}
                                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                                    >
                                        <X size={16} />
                                        <span>Cancel</span>
                                    </button>
                                </div>

                                <div className="relative">
                                    <div id="qr-reader" className="rounded-lg overflow-hidden border-2 border-purple-500"></div>
                                    
                                    <div className="absolute top-4 left-4 right-4 text-center z-10">
                                        <div className="inline-block bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                            Position QR code within frame
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    <p>Point your camera at a house QR code to scan</p>
                                    <p className="text-xs mt-1">Scanning for: {selectedBill?.bill_name}</p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                                <Loader size={32} className="animate-spin mx-auto text-purple-600 mb-4" />
                                <p className="text-gray-600 dark:text-gray-300">Checking access permissions...</p>
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

                                {/* Access Control Status */}
                                {!accessGranted ? (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
                                        <div className="flex items-start">
                                            <AlertCircle size={24} className="text-red-600 dark:text-red-400 mr-3 mt-1" />
                                            <div>
                                                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                                                    Access Denied
                                                </h3>
                                                <p className="text-red-700 dark:text-red-400">
                                                    {accessDeniedReason}
                                                </p>
                                                <div className="mt-3 text-sm text-red-600 dark:text-red-300">
                                                    <p>Requirements to calculate {selectedBill?.bill_name}:</p>
                                                    <ul className="list-disc pl-5 mt-1">
                                                        <li>House must be in your assigned apartment</li>
                                                        <li>House must have "{selectedBill?.bill_name}" assigned</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
                                        <div className="flex items-start">
                                            <div className="bg-green-100 dark:bg-green-800 p-2 rounded-lg mr-3">
                                                <Check size={24} className="text-green-600 dark:text-green-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                                                    Access Granted ✓
                                                </h3>
                                                <p className="text-green-700 dark:text-green-400">
                                                    You can calculate {selectedBill?.bill_name} for this house
                                                </p>
                                                <div className="mt-4">
                                                    <button
                                                        onClick={handleCalculateBill}
                                                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                                    >
                                                        <FileText size={16} />
                                                        Calculate {selectedBill?.bill_name}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* House Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                                                House Information
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
                                                        {getDisplayValue(scannedData).floor}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                                                Bill Information
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Selected Bill:</span>
                                                    <span className="font-medium text-purple-600 dark:text-purple-400">
                                                        {selectedBill?.bill_name}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Bill Type:</span>
                                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                                        {selectedBill?.billtype}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Your Apartments:</span>
                                                    <span className="font-medium text-green-600 dark:text-green-400">
                                                        {userAssignedApartments.length}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Access:</span>
                                                    <span className={`font-medium ${accessGranted ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                        {accessGranted ? 'Granted' : 'Denied'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Start Scanning Button - Only show when no scan in progress */}
                        {!scannedData && !scanning && !loading && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                                <div className="max-w-md mx-auto">
                                    <QrCode size={64} className="mx-auto text-purple-400 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                                        Scan House QR Code
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                                        Scan a house QR code to check if it has <strong>{selectedBill?.bill_name}</strong> assigned
                                    </p>
                                    <div className="space-y-4">
                                        <button
                                            onClick={startScanning}
                                            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Camera size={20} />
                                            Start Scanning
                                        </button>
                                        <button
                                            onClick={handleBackToBills}
                                            className="w-full px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            Back to My Bills
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <ToastContainer 
                position="top-center" 
                autoClose={3000}
                className="mt-12 md:mt-0"
            />
        </div>
    )
}