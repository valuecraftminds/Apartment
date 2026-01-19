// // MeasurableBills.jsx
// import React, { useState, useEffect, useRef, useContext } from 'react'
// import { Loader, ArrowLeft, FileText, Camera, QrCode, AlertCircle, Check, X, Receipt } from 'lucide-react'
// import { toast, ToastContainer } from 'react-toastify'
// import api from '../../api/axios'
// import { Html5QrcodeScanner } from 'html5-qrcode'
// import Sidebar from '../../components/Sidebar'
// import Navbar from '../../components/Navbar'
// import { useNavigate, useParams } from 'react-router-dom'
// import { AuthContext } from '../../contexts/AuthContext'

// export default function MeasurableBills() {
//     const { bill_id } = useParams();
//     const [scanning, setScanning] = useState(false)
//     const [scannedData, setScannedData] = useState(null)
//     const [loading, setLoading] = useState(false)
//     const [selectedBill, setSelectedBill] = useState(null)
//     const [userAssignedApartments, setUserAssignedApartments] = useState([])
//     const [accessGranted, setAccessGranted] = useState(false)
//     const [accessDeniedReason, setAccessDeniedReason] = useState('')
//     const [houseDetails, setHouseDetails] = useState(null)
//     const [manualHouseId, setManualHouseId] = useState('') // State for manual input
//     const scannerRef = useRef(null)
//     const navigate = useNavigate();
//     const { auth } = useContext(AuthContext);

//     // Fetch the specific bill details
//     const fetchSelectedBill = async () => {
//         try {
//             if (!bill_id) return;
            
//             const response = await api.get(`/user-bills/users/${auth.user.id}/bills`);
//             if (response.data.success && Array.isArray(response.data.data)) {
//                 const bill = response.data.data.find(b => b.id === bill_id);
//                 if (bill) {
//                     setSelectedBill(bill);
//                 } else {
//                     toast.error('You are not assigned to this bill');
//                     navigate('/my-bills');
//                 }
//             }
//         } catch (error) {
//             console.error('Error fetching bill details:', error);
//             toast.error('Error loading bill information');
//         }
//     };

//     // Fetch user's assigned apartments
//     const fetchUserApartments = async () => {
//         try {
//             const response = await api.get(`/user-apartments/users/${auth.user.id}/apartments`);
//             if (response.data.success && Array.isArray(response.data.data)) {
//                 setUserAssignedApartments(response.data.data);
//                 return response.data.data;
//             }
//             return [];
//         } catch (error) {
//             console.error('Error fetching user apartments:', error);
//             toast.error('Error loading your assigned apartments');
//             return [];
//         }
//     };

//     // Enhanced checkHouseAccess with additional API calls
//     const checkHouseAccess = async (houseId, userApartments) => {
//         try {
//             console.log('Checking access for house ID:', houseId);
            
//             if (!houseId) {
//                 return {
//                     access: false,
//                     reason: 'Invalid house ID'
//                 };
//             }

//             // Step 1: Get house details
//             const houseResponse = await api.get(`/houses/${houseId}`);
//             if (!houseResponse.data.success || !houseResponse.data.data) {
//                 return {
//                     access: false,
//                     reason: 'House not found in the system'
//                 };
//             }

//             const houseData = houseResponse.data.data;
            
//             // Step 2: Get apartment details
//             let apartmentDetails = null;
//             if (houseData.apartment_id) {
//                 try {
//                     const apartmentResponse = await api.get(`/apartments/${houseData.apartment_id}`);
//                     if (apartmentResponse.data.success) {
//                         apartmentDetails = apartmentResponse.data.data;
//                     }
//                 } catch (apartmentError) {
//                     console.error('Error fetching apartment:', apartmentError);
//                 }
//             }

//             // Step 3: Get floor details
//             let floorDetails = null;
//             if (houseData.floor_id) {
//                 try {
//                     const floorResponse = await api.get(`/floors/${houseData.floor_id}`);
//                     if (floorResponse.data.success) {
//                         floorDetails = floorResponse.data.data;
//                     }
//                 } catch (floorError) {
//                     console.error('Error fetching floor:', floorError);
//                 }
//             }

//             // Combine all data
//             const fullHouseData = {
//                 ...houseData,
//                 apartment: apartmentDetails,
//                 floor: floorDetails
//             };
            
//             setHouseDetails(fullHouseData);

//             // Step 4: Check if user has access to this apartment
//             const userHasApartmentAccess = userApartments.some(
//                 apartment => apartment.id === houseData.apartment_id
//             );

//             if (!userHasApartmentAccess) {
//                 return {
//                     access: false,
//                     reason: `You are not assigned to "${apartmentDetails?.name || 'this apartment'}"`
//                 };
//             }

//             // Step 5: Get bills assigned to this house
//             let billAssignedToHouse = false;
//             try {
//                 // Try the endpoint for checking bill assignments
//                 const response = await api.get(
//                     `/bill-assignments/house-details?house_id=${houseId}&apartment_id=${houseData.apartment_id}`
//                 );
                
//                 if (response.data.success) {
//                     const billsData = Array.isArray(response.data.data) 
//                         ? response.data.data 
//                         : response.data.data?.bills || [];
                    
//                     billAssignedToHouse = billsData.some(
//                         assignment => assignment.bill_id === bill_id || assignment.id === bill_id
//                     );
//                 }
//             } catch (error) {
//                 console.error('Error checking bill assignments:', error);
//                 // If endpoint fails, try alternative approach
//                 try {
//                     // Try to get user's bills and check if this bill is in user's list
//                     const userBillsResponse = await api.get(`/user-bills/users/${auth.user.id}/bills`);
//                     if (userBillsResponse.data.success && Array.isArray(userBillsResponse.data.data)) {
//                         const userBill = userBillsResponse.data.data.find(b => b.id === bill_id);
//                         if (userBill) {
//                             // If user has this bill, we can assume they can access houses in their assigned apartments
//                             billAssignedToHouse = true;
//                         }
//                     }
//                 } catch (err) {
//                     console.error('Alternative check failed:', err);
//                 }
//             }

//             if (!billAssignedToHouse) {
//                 return {
//                     access: false,
//                     reason: `This house does not have "${selectedBill?.bill_name || 'the selected bill'}" assigned`
//                 };
//             }

//             // Step 6: Verify the bill is measurable
//             if (selectedBill?.billtype?.toLowerCase() !== 'measurable') {
//                 return {
//                     access: false,
//                     reason: `"${selectedBill?.bill_name || 'Selected bill'}" is not a measurable bill`
//                 };
//             }

//             return {
//                 access: true,
//                 houseData: fullHouseData,
//                 apartmentId: houseData.apartment_id,
//                 floorId: houseData.floor_id,
//                 houseId: houseData.id
//             };

//         } catch (error) {
//             console.error('Error checking house access:', error);
            
//             // Detailed error handling
//             if (error.code === 'ERR_NETWORK') {
//                 return {
//                     access: false,
//                     reason: 'Network error. Please check your internet connection.'
//                 };
//             }
            
//             const status = error.response?.status;
//             if (status === 401) return { access: false, reason: 'Session expired. Please login again.' };
//             if (status === 403) return { access: false, reason: 'Access denied to this resource.' };
//             if (status === 404) return { access: false, reason: 'House not found.' };
//             if (status === 400) return { access: false, reason: 'Invalid request.' };
            
//             return {
//                 access: false,
//                 reason: 'Unable to verify access at this time. Please try again.'
//             };
//         }
//     };

//     // Handle manual house ID input
//     const handleManualInput = async () => {
//         if (!manualHouseId.trim()) {
//             toast.error('Please enter a house ID');
//             return;
//         }

//         try {
//             setLoading(true);
            
//             // Clear any previous scan data
//             if (scannerRef.current) {
//                 scannerRef.current.clear().catch(error => {
//                     console.log('Scanner clear error:', error)
//                 });
//             }
//             setScanning(false);
            
//             const houseId = manualHouseId.trim();
            
//             // Set scanned data with just the house ID
//             setScannedData({ houseId: houseId, source: 'manual' });
            
//             // Load user's assigned apartments first
//             const apartments = await fetchUserApartments();
            
//             // Check if house exists and user has access
//             const accessResult = await checkHouseAccess(houseId, apartments);
            
//             if (accessResult.access) {
//                 setAccessGranted(true);
//                 toast.success(`Access granted! House ${houseDetails?.house_id || houseId} has ${selectedBill?.bill_name} bill.`);
//             } else {
//                 setAccessGranted(false);
//                 setAccessDeniedReason(accessResult.reason || 'Access denied');
//                 toast.error(accessResult.reason || 'Access denied');
//             }

//         } catch (error) {
//             console.error('Error processing manual input:', error);
//             toast.error(error.message || 'Invalid house ID. Please enter a valid house ID.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Handle manual input change
//     const handleManualInputChange = (e) => {
//         setManualHouseId(e.target.value);
//     };

//     // Handle manual input submit on Enter key
//     const handleManualInputKeyPress = (e) => {
//         if (e.key === 'Enter') {
//             handleManualInput();
//         }
//     };

//     // Initialize QR Scanner
//     const startScanning = () => {
//         setScanning(true)
//         setScannedData(null)
//         setAccessGranted(false)
//         setAccessDeniedReason('')
//         setHouseDetails(null)
//         setManualHouseId('')

//         setTimeout(() => {
//             try {
//                 if (scannerRef.current) {
//                     scannerRef.current.clear().catch(error => {
//                         console.log('Scanner clear error:', error)
//                     })
//                 }

//                 scannerRef.current = new Html5QrcodeScanner(
//                     "qr-reader",
//                     {
//                         fps: 10,
//                         qrbox: { width: 250, height: 250 },
//                         aspectRatio: 1.0,
//                     },
//                     false
//                 )

//                 scannerRef.current.render(
//                     (decodedText) => {
//                         handleScanSuccess(decodedText)
//                     },
//                     (error) => {
//                         console.log('QR Scan error:', error)
//                     }
//                 )
//             } catch (error) {
//                 console.error('Scanner initialization error:', error)
//                 toast.error('Failed to initialize scanner. Please refresh and try again.')
//             }
//         }, 100)
//     }

//     // Handle successful scan - QR contains only house ID
//     const handleScanSuccess = async (decodedText) => {
//         try {
//             setLoading(true);
            
//             if (scannerRef.current) {
//                 await scannerRef.current.clear();
//             }
//             setScanning(false);
//             setManualHouseId('');

//             console.log('Scanned house ID:', decodedText);
            
//             // QR contains only house ID (from QRCodeGenerator)
//             const houseId = decodedText.trim();
            
//             // Set scanned data with just the house ID
//             setScannedData({ houseId: houseId, source: 'qr' });
            
//             // Load user's assigned apartments first
//             const apartments = await fetchUserApartments();
            
//             // Check if house exists and user has access
//             const accessResult = await checkHouseAccess(houseId, apartments);
            
//             if (accessResult.access) {
//                 setAccessGranted(true);
//                 toast.success(`Access granted! House ${houseDetails?.house_id || houseId} has ${selectedBill?.bill_name} bill.`);
//             } else {
//                 setAccessGranted(false);
//                 setAccessDeniedReason(accessResult.reason || 'Access denied');
//                 toast.error(accessResult.reason || 'Access denied');
//             }

//         } catch (error) {
//             console.error('Error processing QR code:', error);
//             toast.error(error.message || 'Invalid QR code. Please scan a valid house QR code.');
//             setScanning(false);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Reset and clean up
//     const handleReset = () => {
//         if (scannerRef.current) {
//             scannerRef.current.clear().catch(error => {
//                 console.log('Scanner clear error on reset:', error)
//             })
//         }
//         setScanning(false)
//         setScannedData(null)
//         setAccessGranted(false)
//         setAccessDeniedReason('')
//         setHouseDetails(null)
//         setManualHouseId('')
//     }

//     // Go back to My Bills
//     const handleBackToBills = () => {
//         navigate('/my-bills');
//     }

//     // Navigate to calculate bill
//     const handleCalculateBill = () => {
//         if (!houseDetails || !scannedData) {
//             toast.error('House data not available');
//             return;
//         }
        
//         navigate(`/calculate-measurable-bill/${bill_id}`, {
//             state: {
//                 scannedData: scannedData,
//                 billData: selectedBill,
//                 actualBillId: bill_id,
//                 houseData: houseDetails,
//                 houseId: houseDetails.id, // Use the actual house ID from database
//                 source: scannedData.source // Pass source info
//             }
//         });
//     };

//     // Clean up on component unmount
//     useEffect(() => {
//         return () => {
//             if (scannerRef.current) {
//                 scannerRef.current.clear().catch(error => {
//                     console.log('Scanner clear error on unmount:', error)
//                 })
//             }
//         }
//     }, [])

//     // Load data on component mount
//     useEffect(() => {
//         if (auth?.user?.id && bill_id) {
//             fetchSelectedBill();
//             fetchUserApartments();
//         }
//     }, [auth?.user?.id, bill_id]);

//     return (
//         <div className="min-h-screen bg-gray-50 dark:bg-gray-900">            
//             <div className="flex">
//                 <Sidebar />
                
//                 <div className="flex-1 p-4">
//                     <div className="max-w-4xl mx-auto">
//                         {/* Scanning Interface */}
//                         {scanning && (
//                             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
//                                 <div className="flex justify-between items-center mb-4">
//                                     <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
//                                         Scanner Active
//                                     </h2>
//                                     <button
//                                         onClick={handleReset}
//                                         className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
//                                     >
//                                         <X size={16} />
//                                         <span>Cancel</span>
//                                     </button>
//                                 </div>

//                                 <div className="relative">
//                                     <div id="qr-reader" className="rounded-lg overflow-hidden border-2 border-purple-500 dark:text-gray-100 text-gray-700"></div>
                                    
//                                     <div className="absolute top-4 left-4 right-4 text-center z-10">
//                                         <div className="inline-block bg-black/70 text-white px-3 py-1 rounded-full text-sm">
//                                             Position QR code within frame
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
//                                     <p>Point your camera at a house QR code to scan</p>
//                                     <p className="text-xs mt-1">Scanning for: {selectedBill?.bill_name}</p>
//                                     <p className="text-xs mt-1 text-purple-600">QR contains House ID only</p>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Loading State */}
//                         {loading && (
//                             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
//                                 <Loader size={32} className="animate-spin mx-auto text-purple-600 mb-4" />
//                                 <p className="text-gray-600 dark:text-gray-300">Fetching house details and checking access...</p>
//                             </div>
//                         )}

//                         {/* Scanned Results */}
//                         {scannedData && !loading && !scanning && (
//                             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
//                                 <div className="flex justify-between items-start mb-6">
//                                     <div>
//                                         <h2 className="text-xl font-bold text-gray-800 dark:text-white">
//                                             House Details
//                                         </h2>
//                                         <p className="text-gray-600 dark:text-gray-300">
//                                             Information fetched from system
//                                         </p>
//                                     </div>
//                                     <button
//                                         onClick={handleReset}
//                                         className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//                                     >
//                                         <ArrowLeft size={16} />
//                                         <span>Scan Another</span>
//                                     </button>
//                                 </div>

//                                 {/* House Details Card */}
//                                 {/* {houseDetails && (
//                                     <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
//                                         <h3 className="font-semibold text-gray-800 dark:text-white mb-3">House Information</h3>
//                                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                             <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
//                                                 <p className="text-sm text-gray-500 dark:text-gray-400">House ID</p>
//                                                 <p className="font-semibold text-gray-800 dark:text-white">{houseDetails.house_id}</p>
//                                             </div>
//                                             <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
//                                                 <p className="text-sm text-gray-500 dark:text-gray-400">Apartment</p>
//                                                 <p className="font-semibold text-gray-800 dark:text-white">{houseDetails.apartment?.name || 'N/A'}</p>
//                                             </div>
//                                             <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
//                                                 <p className="text-sm text-gray-500 dark:text-gray-400">Floor</p>
//                                                 <p className="font-semibold text-gray-800 dark:text-white">{houseDetails.floor?.floor_id || 'N/A'}</p>
//                                             </div>
//                                         </div>
//                                         <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
//                                             <p>Source: <span className="font-medium">{scannedData.source === 'manual' ? 'Manual Entry' : 'QR Scan'}</span></p>
//                                             <p className="mt-1">Entered ID: <code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">{scannedData.houseId}</code></p>
//                                         </div>
//                                     </div>
//                                 )} */}

//                                 {/* Access Control Status */}
//                                 {!accessGranted ? (
//                                     <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
//                                         <div className="flex items-start">
//                                             <AlertCircle size={24} className="text-red-600 dark:text-red-400 mr-3 mt-1" />
//                                             <div>
//                                                 <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
//                                                     Access Denied
//                                                 </h3>
//                                                 <p className="text-red-700 dark:text-red-400">
//                                                     {accessDeniedReason}
//                                                 </p>
//                                                 <div className="mt-3 text-sm text-red-600 dark:text-red-300">
//                                                     <p>Requirements to calculate {selectedBill?.bill_name}:</p>
//                                                     <ul className="list-disc pl-5 mt-1">
//                                                         <li>House must be in your assigned apartment</li>
//                                                         <li>House must have "{selectedBill?.bill_name}" assigned</li>
//                                                         <li>House must exist in the system</li>
//                                                     </ul>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
//                                         <div className="flex items-start">
//                                             <div className="bg-green-100 dark:bg-green-800 p-2 rounded-lg mr-3">
//                                                 <Check size={24} className="text-green-600 dark:text-green-400" />
//                                             </div>
//                                             <div className="flex-1">
//                                                 <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
//                                                     Access Granted ✓
//                                                 </h3>
//                                                 <p className="text-green-700 dark:text-green-400">
//                                                     You can calculate {selectedBill?.bill_name} for this house
//                                                 </p>
//                                                 <div className="mt-6">
//                                                     <button
//                                                         onClick={handleCalculateBill}
//                                                         className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
//                                                     >
//                                                         <FileText size={16} />
//                                                         Calculate Bill
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         )}

//                         {/* Start Scanning Button - Only show when no scan in progress */}
//                         {!scannedData && !scanning && !loading && (
//                             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
//                                 {/* Manual Input Section */}
//                                 <div className='max-w-md mx-auto mb-2'>
//                                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                         Enter House ID:
//                                     </label>
//                                     <input 
//                                         type='text' 
//                                         className='w-full mt-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
//                                         value={manualHouseId}
//                                         onChange={handleManualInputChange}
//                                         onKeyPress={handleManualInputKeyPress}
//                                         placeholder='e.g., H001-458-982' 
//                                     />
//                                     <div>
//                                         <button 
//                                             onClick={handleManualInput}
//                                             className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 w-full"
//                                         >
//                                             <FileText size={16} />
//                                             Check Access
//                                         </button>
//                                     </div>
//                                 </div>
                                
//                                 <div className='max-w-md mx-auto mb-2'>
//                                     <label className='font-bold text-2xl text-gray-700 dark:text-gray-100'>Or</label>
//                                 </div>
                                
//                                 {/* QR Scan Section */}
//                                 <div className="max-w-md mx-auto">
//                                     <QrCode size={64} className="mx-auto text-purple-400 mb-4" />
//                                     <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
//                                         Scan House QR Code
//                                     </h3>
//                                     <p className="text-gray-600 dark:text-gray-300 mb-4">
//                                         Scan a house QR code to check if it has <strong>{selectedBill?.bill_name}</strong> assigned
//                                     </p>
//                                     <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
//                                         QR codes contain only House ID. System will fetch all details automatically.
//                                     </p>
//                                     <div className="space-y-4">
//                                         <button
//                                             onClick={startScanning}
//                                             className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
//                                         >
//                                             <Camera size={20} />
//                                             Start Scanning
//                                         </button>
//                                         <button
//                                             onClick={handleBackToBills}
//                                             className="w-full px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//                                         >
//                                             Back to My Bills
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//             <ToastContainer 
//                 position="top-center" 
//                 autoClose={3000}
//                 className="mt-12 md:mt-0"
//             />
//         </div>
//     )
// }

// MeasurableBills.jsx
import React, { useState, useEffect, useRef, useContext } from 'react'
import { Loader, ArrowLeft, FileText, Camera, QrCode, AlertCircle, Check, X, Receipt, RotateCw, Smartphone } from 'lucide-react'
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
    const [manualHouseId, setManualHouseId] = useState('')
    const [cameraDevices, setCameraDevices] = useState([])
    const [selectedCamera, setSelectedCamera] = useState(null)
    const [isFrontCamera, setIsFrontCamera] = useState(false)
    const [showCameraOptions, setShowCameraOptions] = useState(false)
    const scannerRef = useRef(null)
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);

    // Fetch available cameras
    const getAvailableCameras = async () => {
        try {
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0) {
                setCameraDevices(devices);
                
                // Try to find front/back cameras
                const frontCamera = devices.find(device => 
                    device.label.toLowerCase().includes('front') || 
                    device.label.toLowerCase().includes('selfie')
                );
                const backCamera = devices.find(device => 
                    device.label.toLowerCase().includes('back') || 
                    device.label.toLowerCase().includes('rear') ||
                    device.label.toLowerCase().includes('environment')
                );
                
                // Default to back camera if available, otherwise first camera
                const defaultCamera = backCamera || (devices.length > 0 ? devices[0] : null);
                setSelectedCamera(defaultCamera?.id || '');
                setIsFrontCamera(!!frontCamera && !backCamera);
            }
        } catch (error) {
            console.error('Error getting cameras:', error);
            toast.error('Could not access camera devices');
        }
    };

    // Initialize QR Scanner with selected camera
    const startScanning = async () => {
        setScanning(true);
        setScannedData(null);
        setAccessGranted(false);
        setAccessDeniedReason('');
        setHouseDetails(null);
        setManualHouseId('');

        try {
            // Get available cameras if not already loaded
            if (cameraDevices.length === 0) {
                await getAvailableCameras();
            }

            // Clean up existing scanner
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.log('Scanner clear error:', error);
                });
            }

            // Start scanning with selected camera
            setTimeout(() => {
                try {
                    scannerRef.current = new Html5QrcodeScanner(
                        "qr-reader",
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0,
                        },
                        false
                    );

                    scannerRef.current.render(
                        (decodedText) => {
                            handleScanSuccess(decodedText);
                        },
                        (error) => {
                            console.log('QR Scan error:', error);
                        }
                    );

                    // Apply camera selection if available
                    if (selectedCamera) {
                        scannerRef.current.applyVideoConstraints({
                            deviceId: { exact: selectedCamera }
                        }).catch(err => {
                            console.log('Could not apply camera constraints:', err);
                        });
                    }

                } catch (error) {
                    console.error('Scanner initialization error:', error);
                    toast.error('Failed to initialize scanner. Please refresh and try again.');
                    setScanning(false);
                }
            }, 100);

        } catch (error) {
            console.error('Error starting scanner:', error);
            toast.error('Failed to start camera. Please check permissions.');
            setScanning(false);
        }
    };

    // Toggle between front and back camera
    const toggleCamera = () => {
        if (cameraDevices.length < 2) {
            toast.info('Only one camera available');
            return;
        }

        // Find opposite camera
        const currentIsFront = isFrontCamera;
        let newCamera = null;

        if (currentIsFront) {
            // Switch to back camera
            newCamera = cameraDevices.find(device => 
                device.label.toLowerCase().includes('back') || 
                device.label.toLowerCase().includes('rear') ||
                device.label.toLowerCase().includes('environment')
            );
            if (!newCamera) {
                // If no back camera, use any non-front camera
                newCamera = cameraDevices.find(device => 
                    !device.label.toLowerCase().includes('front') && 
                    !device.label.toLowerCase().includes('selfie')
                );
            }
        } else {
            // Switch to front camera
            newCamera = cameraDevices.find(device => 
                device.label.toLowerCase().includes('front') || 
                device.label.toLowerCase().includes('selfie')
            );
        }

        // If no opposite camera found, toggle between first and second camera
        if (!newCamera) {
            const currentIndex = cameraDevices.findIndex(device => device.id === selectedCamera);
            newCamera = cameraDevices[(currentIndex + 1) % cameraDevices.length];
        }

        if (newCamera && scannerRef.current && scanning) {
            setSelectedCamera(newCamera.id);
            setIsFrontCamera(newCamera.label.toLowerCase().includes('front') || 
                           newCamera.label.toLowerCase().includes('selfie'));
            
            // Apply new camera
            scannerRef.current.applyVideoConstraints({
                deviceId: { exact: newCamera.id }
            }).then(() => {
                toast.success(`Switched to ${isFrontCamera ? 'front' : 'back'} camera`);
            }).catch(err => {
                console.log('Camera switch error:', err);
                toast.error('Failed to switch camera');
            });
        }
    };

    // Select specific camera
    const selectCamera = (deviceId, deviceLabel) => {
        if (scannerRef.current && scanning) {
            setSelectedCamera(deviceId);
            setIsFrontCamera(deviceLabel.toLowerCase().includes('front') || 
                           deviceLabel.toLowerCase().includes('selfie'));
            
            scannerRef.current.applyVideoConstraints({
                deviceId: { exact: deviceId }
            }).then(() => {
                toast.success(`Camera selected: ${deviceLabel}`);
                setShowCameraOptions(false);
            }).catch(err => {
                console.log('Camera selection error:', err);
                toast.error('Failed to select camera');
            });
        }
    };

    // Handle successful scan
    const handleScanSuccess = async (decodedText) => {
        try {
            setLoading(true);
            
            if (scannerRef.current) {
                await scannerRef.current.clear();
            }
            setScanning(false);
            setManualHouseId('');
            setShowCameraOptions(false);

            console.log('Scanned house ID:', decodedText);
            
            const houseId = decodedText.trim();
            setScannedData({ houseId: houseId, source: 'qr' });
            
            const apartments = await fetchUserApartments();
            const accessResult = await checkHouseAccess(houseId, apartments);
            
            if (accessResult.access) {
                setAccessGranted(true);
                toast.success(`Access granted! House ${houseDetails?.house_id || houseId} has ${selectedBill?.bill_name} bill.`);
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
    };

    // Reset and clean up
    const handleReset = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(error => {
                console.log('Scanner clear error on reset:', error);
            });
        }
        setScanning(false);
        setScannedData(null);
        setAccessGranted(false);
        setAccessDeniedReason('');
        setHouseDetails(null);
        setManualHouseId('');
        setShowCameraOptions(false);
    };

    // Rest of your existing methods remain the same...
    // (fetchSelectedBill, fetchUserApartments, checkHouseAccess, etc.)

    // Update the scanning interface in the return statement:

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">            
            <div className="flex">
                <Sidebar />
                
                <div className="flex-1 p-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Scanning Interface */}
                        {scanning && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                            Scanner Active
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 text-xs rounded-full ${isFrontCamera ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'}`}>
                                                {isFrontCamera ? 'Front Camera' : 'Back Camera'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Camera Toggle Button */}
                                        {cameraDevices.length > 1 && (
                                            <button
                                                onClick={toggleCamera}
                                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                title="Switch Camera"
                                            >
                                                <RotateCw size={16} />
                                                <span className="hidden sm:inline">Switch Camera</span>
                                            </button>
                                        )}

                                        {/* Camera Options Button */}
                                        <button
                                            onClick={() => setShowCameraOptions(!showCameraOptions)}
                                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                            title="Camera Options"
                                        >
                                            <Smartphone size={16} />
                                            <span className="hidden sm:inline">Cameras</span>
                                        </button>

                                        <button
                                            onClick={handleReset}
                                            className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors"
                                        >
                                            <X size={16} />
                                            <span>Cancel</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Camera Options Dropdown */}
                                {showCameraOptions && cameraDevices.length > 0 && (
                                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Select Camera:
                                        </h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {cameraDevices.map((device) => (
                                                <button
                                                    key={device.id}
                                                    onClick={() => selectCamera(device.id, device.label)}
                                                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedCamera === device.id
                                                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300'
                                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <Smartphone size={14} className="mr-2" />
                                                            <span className="truncate">
                                                                {device.label || `Camera ${device.id.substring(0, 8)}`}
                                                            </span>
                                                        </div>
                                                        {selectedCamera === device.id && (
                                                            <Check size={14} />
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {device.id === selectedCamera ? 
                                                            (isFrontCamera ? 'Front Camera' : 'Back Camera') : 
                                                            (device.label.toLowerCase().includes('front') || 
                                                             device.label.toLowerCase().includes('selfie') ? 
                                                             'Front Camera' : 'Back Camera')}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="relative">
                                    <div id="qr-reader" className="rounded-lg overflow-hidden border-2 border-purple-500 dark:text-gray-100 text-gray-700"></div>
                                    
                                    <div className="absolute top-4 left-4 right-4 text-center z-10">
                                        <div className="inline-block bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                            Position QR code within frame
                                        </div>
                                    </div>

                                    {/* Camera overlay controls */}
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-10">
                                        {cameraDevices.length > 1 && (
                                            <button
                                                onClick={toggleCamera}
                                                className="bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
                                                title="Switch Camera"
                                            >
                                                <RotateCw size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    <p>Point your camera at a house QR code to scan</p>
                                    <p className="text-xs mt-1">Scanning for: {selectedBill?.bill_name}</p>
                                    <p className="text-xs mt-1 text-purple-600">QR contains House ID only</p>
                                    <p className="text-xs mt-1">
                                        {cameraDevices.length > 0 ? 
                                            `${cameraDevices.length} camera(s) available` : 
                                            'No cameras detected'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Rest of your component remains the same... */}
                        {/* Loading State, Scanned Results, Start Scanning Button, etc. */}

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