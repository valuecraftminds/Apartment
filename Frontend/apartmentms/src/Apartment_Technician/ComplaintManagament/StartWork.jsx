// StartWork.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  Loader, 
  ArrowLeft, 
  Camera, 
  QrCode, 
  AlertCircle, 
  Check, 
  X, 
  FileText, 
  RotateCw,
  Home,
  Building2,
  MapPin,
  Timer,
  Play,
  Pause,
  StopCircle,
  Clock,
  Wrench,
  PlayCircle
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { AuthContext } from '../../contexts/AuthContext';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import HoldComplaintModal from './HoldComplaintModal';

export default function StartWork() {
    const { complaintId } = useParams();
    const location = useLocation();
    const [complaint, setComplaint] = useState(location.state?.complaint || null);
    const [scanning, setScanning] = useState(false);
    const [scannedData, setScannedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [accessGranted, setAccessGranted] = useState(false);
    const [accessDeniedReason, setAccessDeniedReason] = useState('');
    const [houseDetails, setHouseDetails] = useState(null);
    const [manualHouseId, setManualHouseId] = useState('');
    const [timerRunning, setTimerRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [cameraDirection, setCameraDirection] = useState('environment'); // 'environment' (back) or 'user' (front)
    const scannerRef = useRef(null);
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    const timerIntervalRef = useRef(null);
    const [workStarted, setWorkStarted] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [showHoldModal, setShowHoldModal] = useState(false);
    const [holdStatus, setHoldStatus] = useState(null);
    const [loadingHoldStatus, setLoadingHoldStatus] = useState(false);

    // Fetch complaint details if not passed in state
    useEffect(() => {
        const fetchComplaintDetails = async () => {
            if (!complaint && complaintId) {
                try {
                    setLoading(true);
                    const response = await api.get(`/complaints/${complaintId}`, {
                        headers: {
                            Authorization: `Bearer ${auth.accessToken}`
                        }
                    });
                    
                    if (response.data.success) {
                        setComplaint(response.data.data);
                    } else {
                        toast.error('Failed to load complaint details');
                        navigate('/my-complaints');
                    }
                } catch (error) {
                    console.error('Error fetching complaint:', error);
                    toast.error('Error loading complaint information');
                    navigate('/my-complaints');
                } finally {
                    setLoading(false);
                }
            }
        };

        if (auth?.accessToken && complaintId) {
            fetchComplaintDetails();
        }
    }, [complaintId, auth?.accessToken, complaint, navigate]);

    // Check if house is valid for this complaint
    const checkHouseAccess = async (houseId) => {
        try {
            console.log('Checking access for house ID:', houseId);
            
            if (!houseId) {
                return {
                    access: false,
                    reason: 'Invalid house ID'
                };
            }

            // Get house details
            const houseResponse = await api.get(`/houses/${houseId}`);
            if (!houseResponse.data.success || !houseResponse.data.data) {
                return {
                    access: false,
                    reason: 'House not found in the system'
                };
            }

            const houseData = houseResponse.data.data;
            
            // Verify this house matches the complaint's house
            if (complaint && complaint.house_id !== houseData.id) {
                return {
                    access: false,
                    reason: `This house (${houseData.house_id}) does not match the complaint's house (House ${complaint.house_number})`
                };
            }

            // Get apartment details
            let apartmentDetails = null;
            if (houseData.apartment_id) {
                try {
                    const apartmentResponse = await api.get(`/apartments/${houseData.apartment_id}`);
                    if (apartmentResponse.data.success) {
                        apartmentDetails = apartmentResponse.data.data;
                    }
                } catch (apartmentError) {
                    console.error('Error fetching apartment:', apartmentError);
                }
            }

            // Get floor details
            let floorDetails = null;
            if (houseData.floor_id) {
                try {
                    const floorResponse = await api.get(`/floors/${houseData.floor_id}`);
                    if (floorResponse.data.success) {
                        floorDetails = floorResponse.data.data;
                    }
                } catch (floorError) {
                    console.error('Error fetching floor:', floorError);
                }
            }

            // Combine all data
            const fullHouseData = {
                ...houseData,
                apartment: apartmentDetails,
                floor: floorDetails
            };
            
            setHouseDetails(fullHouseData);

            return {
                access: true,
                houseData: fullHouseData,
                apartmentId: houseData.apartment_id,
                floorId: houseData.floor_id,
                houseId: houseData.id
            };

        } catch (error) {
            console.error('Error checking house access:', error);
            
            // Detailed error handling
            if (error.code === 'ERR_NETWORK') {
                return {
                    access: false,
                    reason: 'Network error. Please check your internet connection.'
                };
            }
            
            const status = error.response?.status;
            if (status === 401) return { access: false, reason: 'Session expired. Please login again.' };
            if (status === 403) return { access: false, reason: 'Access denied to this resource.' };
            if (status === 404) return { access: false, reason: 'House not found.' };
            if (status === 400) return { access: false, reason: 'Invalid request.' };
            
            return {
                access: false,
                reason: 'Unable to verify access at this time. Please try again.'
            };
        }
    };

    // Start the timer and update complaint status
    const startComplaintTimer = async () => {
        try {
            const response = await api.post(`/complaints/${complaintId}/timer/start`, {}, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`
                }
            });

            if (response.data.success) {
                // Get the actual timer status from backend
                const timerStatus = response.data.data;
                
                // Update state
                setTimerRunning(true);
                setWorkStarted(true);
                setElapsedTime(timerStatus.currentElapsedTime || 0);
                
                // Start local timer for display
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                }
                
                timerIntervalRef.current = setInterval(() => {
                    setElapsedTime(prev => prev + 1);
                }, 1000);

                toast.success('Work started! Timer is now running.');
                
                // Update complaint status in local state
                setComplaint(prev => ({
                    ...prev,
                    status: 'In Progress',
                    is_timer_running: true,
                    work_started_at: new Date().toISOString()
                }));

                return true;
            } else {
                toast.error(response.data.message || 'Failed to start timer');
                return false;
            }
        } catch (error) {
            console.error('Error starting timer:', error);
            toast.error(error.response?.data?.message || 'Failed to start timer');
            return false;
        }
    };

    // Stop the timer and mark complaint as completed
    const stopComplaintTimer = async () => {
        try {
            const response = await api.post(`/complaints/${complaintId}/timer/stop`, {}, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`
                }
            });

            if (response.data.success) {
                setTimerRunning(false);
                setWorkStarted(false);
                
                // Clear interval
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                    timerIntervalRef.current = null;
                }

                // Update elapsed time from response
                if (response.data.data && response.data.data.currentElapsedTime) {
                    setElapsedTime(response.data.data.currentElapsedTime);
                }

                toast.success('Work completed! Timer stopped.');
                
                // Update complaint status in local state
                setComplaint(prev => ({
                    ...prev,
                    status: 'Resolved',
                    is_timer_running: false,
                    work_paused_at: new Date().toISOString()
                }));

                // Navigate back to complaints list after a delay
                setTimeout(() => {
                    navigate('/my-complaints');
                }, 3000);

                return true;
            } else {
                toast.error(response.data.message || 'Failed to stop timer');
                return false;
            }
        } catch (error) {
            console.error('Error stopping timer:', error);
            toast.error(error.response?.data?.message || 'Failed to stop timer');
            return false;
        }
    };

    // Pause the timer
    const pauseComplaintTimer = async () => {
        try {
            const response = await api.post(`/complaints/${complaintId}/timer/pause`, {}, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`
                }
            });

            if (response.data.success) {
                setTimerRunning(false);
                
                // Clear interval
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                    timerIntervalRef.current = null;
                }

                // Update elapsed time from response
                if (response.data.data && response.data.data.currentElapsedTime) {
                    setElapsedTime(response.data.data.currentElapsedTime);
                }

                toast.success('Timer paused');
                return true;
            } else {
                toast.error(response.data.message || 'Failed to pause timer');
                return false;
            }
        } catch (error) {
            console.error('Error pausing timer:', error);
            toast.error(error.response?.data?.message || 'Failed to pause timer');
            return false;
        }
    };


    // Resume the timer
    const resumeComplaintTimer = async () => {
        try {
            const response = await api.post(`/complaints/${complaintId}/timer/resume`, {}, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`
                }
            });

            if (response.data.success) {
                setTimerRunning(true);
                
                // Start interval for UI
                if (!timerIntervalRef.current) {
                    timerIntervalRef.current = setInterval(() => {
                        setElapsedTime(prev => prev + 1);
                    }, 1000);
                }

                toast.success('Timer resumed');
                return true;
            } else {
                toast.error(response.data.message || 'Failed to resume timer');
                return false;
            }
        } catch (error) {
            console.error('Error resuming timer:', error);
            toast.error(error.response?.data?.message || 'Failed to resume timer');
            return false;
        }
    };

    // Handle manual house ID input
    const handleManualInput = async () => {
        if (!manualHouseId.trim()) {
            toast.error('Please enter a house ID');
            return;
        }

        try {
            setLoading(true);
            
            // Clear any previous scan data
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.log('Scanner clear error:', error);
                });
            }
            setScanning(false);
            
            const houseId = manualHouseId.trim();
            
            // Set scanned data
            setScannedData({ houseId: houseId, source: 'manual' });
            
            // If complaint is on hold, just verify location
            if (holdStatus?.is_on_hold) {
                const accessResult = await checkHouseAccess(houseId);
                
                if (accessResult.access) {
                    toast.success('Location verified! Ready to resume from hold.');
                    setAccessGranted(true);
                    // Don't start timer here
                } else {
                    setAccessGranted(false);
                    setAccessDeniedReason(accessResult.reason || 'Access denied');
                    toast.error(accessResult.reason || 'Access denied');
                }
            } else {
                // Normal flow
                const accessResult = await checkHouseAccess(houseId);
                
                if (accessResult.access) {
                    setAccessGranted(true);
                    toast.success(`Access granted! This is the correct house.`);
                    
                    // Auto-start timer
                    try {
                        const timerStarted = await startComplaintTimer();
                        if (timerStarted) {
                            setTimerRunning(true);
                            setWorkStarted(true);
                            
                            // Update complaint status immediately
                            setComplaint(prev => ({
                                ...prev,
                                status: 'In Progress',
                                is_timer_running: true
                            }));
                        }
                    } catch (error) {
                        toast.error('Failed to start timer: ' + error.message);
                    }
                } else {
                    setAccessGranted(false);
                    setAccessDeniedReason(accessResult.reason || 'Access denied');
                    toast.error(accessResult.reason || 'Access denied');
                }
            }

        } catch (error) {
            console.error('Error processing manual input:', error);
            toast.error(error.message || 'Invalid house ID. Please enter a valid house ID.');
        } finally {
            setLoading(false);
        }
    };

    // Initialize QR Scanner
    const startScanning = () => {
        setScanning(true);
        setScannedData(null);
        setAccessGranted(false);
        setAccessDeniedReason('');
        setHouseDetails(null);
        setManualHouseId('');

        setTimeout(() => {
            try {
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(error => {
                        console.log('Scanner clear error:', error);
                    });
                }

                scannerRef.current = new Html5QrcodeScanner(
                    "qr-reader",
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
                        facingMode: cameraDirection // Use selected camera direction
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
            } catch (error) {
                console.error('Scanner initialization error:', error);
                toast.error('Failed to initialize scanner. Please refresh and try again.');
            }
        }, 100);
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

            console.log('Scanned house ID:', decodedText);
            
            const houseId = decodedText.trim();
            
            // Set scanned data
            setScannedData({ houseId: houseId, source: 'qr' });
            
            // If complaint is on hold, just verify location without starting timer
            if (holdStatus?.is_on_hold) {
                const accessResult = await checkHouseAccess(houseId);
                
                if (accessResult.access) {
                    toast.success('Location verified! Ready to resume from hold.');
                    setAccessGranted(true);
                    // Don't start timer here - let user click "Resume from Hold" button
                } else {
                    setAccessGranted(false);
                    setAccessDeniedReason(accessResult.reason || 'Access denied');
                    toast.error(accessResult.reason || 'Access denied');
                }
            } else {
                // Normal flow for non-held complaints
                const accessResult = await checkHouseAccess(houseId);
                
                if (accessResult.access) {
                    setAccessGranted(true);
                    toast.success(`Access granted! This is the correct house.`);

                    // Auto-start timer only for non-held complaints
                    try {
                        const timerStarted = await startComplaintTimer();
                        if (timerStarted) {
                            setTimerRunning(true);
                            setWorkStarted(true);
                            
                            // Update complaint status immediately
                            setComplaint(prev => ({
                                ...prev,
                                status: 'In Progress',
                                is_timer_running: true
                            }));
                        }
                    } catch (error) {
                        toast.error('Failed to start timer: ' + error.message);
                    }
                } else {
                    setAccessGranted(false);
                    setAccessDeniedReason(accessResult.reason || 'Access denied');
                    toast.error(accessResult.reason || 'Access denied');
                }
            }

        } catch (error) {
            console.error('Error processing QR code:', error);
            toast.error(error.message || 'Invalid QR code. Please scan a valid house QR code.');
            setScanning(false);
        } finally {
            setLoading(false);
        }
    };

    // Toggle camera direction
    const toggleCameraDirection = () => {
        const newDirection = cameraDirection === 'environment' ? 'user' : 'environment';
        setCameraDirection(newDirection);
        
        if (scanning) {
            // Restart scanning with new camera direction
            startScanning();
        }
    };

    // Format time to HH:MM:SS
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Reset and clean up
    const handleReset = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(error => {
                console.log('Scanner clear error on reset:', error);
            });
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        setScanning(false);
        setScannedData(null);
        setAccessGranted(false);
        setAccessDeniedReason('');
        setHouseDetails(null);
        setManualHouseId('');
        setTimerRunning(false);
        setElapsedTime(0);
        setWorkStarted(false);
    };

    // Clean up on component unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.log('Scanner clear error on unmount:', error);
                });
            }
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // Check if timer is already running when component loads
        const checkExistingTimer = async () => {
            if (complaintId && auth?.accessToken) {
                try {
                    const response = await api.get(`/complaints/${complaintId}/timer/status`, {
                        headers: {
                            Authorization: `Bearer ${auth.accessToken}`
                        }
                    });
                    
                    if (response.data.success && response.data.data) {
                        const timerData = response.data.data;
                        if (timerData.is_timer_running) {
                            setTimerRunning(true);
                            setWorkStarted(true);
                            setElapsedTime(timerData.currentElapsedTime || 0);
                            
                            // Start the interval
                            timerIntervalRef.current = setInterval(() => {
                                setElapsedTime(prev => prev + 1);
                            }, 1000);
                        }
                    }
                } catch (error) {
                    console.log('No active timer found');
                }
            }
        };

        checkExistingTimer();

        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [complaintId, auth?.accessToken]);
    // Format date
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'N/A';
        }
    };

    //hold complaint modal handling
    const fetchHoldStatus = async () => {
    try {
        setLoadingHoldStatus(true);
        const response = await api.get(`/complaints/${complaintId}/hold-status`, {
        headers: {
            Authorization: `Bearer ${auth.accessToken}`
        }
        });
        
        if (response.data.success) {
        setHoldStatus(response.data.data);
        }
    } catch (error) {
        console.error('Error fetching hold status:', error);
    } finally {
        setLoadingHoldStatus(false);
    }
    };

    // Call fetchHoldStatus when component loads
    useEffect(() => {
    if (complaintId && auth?.accessToken) {
        fetchHoldStatus();
    }
    }, [complaintId, auth?.accessToken]);

    const handleResumeFromHold = async () => {
        try {
            setLoading(true);
            const resumed = await api.post(`/complaints/${complaintId}/resume`, {}, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`
                }
            });

            if (resumed.data.success) {
                toast.success('Complaint resumed from hold');
                
                // Update local state
                setHoldStatus(null);
                setTimerRunning(true);
                setWorkStarted(true);
                
                // Update complaint status
                setComplaint(prev => ({
                    ...prev,
                    status: 'In Progress',
                    is_timer_running: true,
                    is_on_hold: false
                }));
                
                // Start interval for UI
                if (timerIntervalRef.current) {
                    clearInterval(timerIntervalRef.current);
                }
                
                timerIntervalRef.current = setInterval(() => {
                    setElapsedTime(prev => prev + 1);
                }, 1000);
                
            } else {
                toast.error(resumed.data.message || 'Failed to resume complaint');
            }
        } catch (error) {
            console.error('Error resuming from hold:', error);
            toast.error(error.response?.data?.message || 'Failed to resume complaint');
        } finally {
            setLoading(false);
        }
    };

        // Add the handleHoldSuccess function
    const handleHoldSuccess = () => {
        fetchHoldStatus();
        setTimerRunning(false);
        
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">            
            <div className="flex">
                <Sidebar/>
                
                <div className='flex-1 p-4'>                    
                    <div className="max-w-4xl mx-auto">
                        {/* Complaint Information Card */}
                        {complaint && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                            Complaint: {complaint.complaint_number}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {complaint.title}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {/* <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Location</h3>
                                        <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                                            <Building2 size={16} className="mr-2" />
                                            <span>{complaint.apartment_name || 'Unknown Apartment'}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                                            <MapPin size={16} className="mr-2" />
                                            <span>Floor {complaint.floor_number} • House {complaint.house_number}</span>
                                        </div>
                                    </div> */}

                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Status</h3>
                                        <div className="flex items-center">
                                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                                complaint.status === 'Pending' 
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                    : complaint.status === 'In Progress'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                            }`}>
                                                {complaint.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                            Created: {formatDate(complaint.created_at)}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Description</h3>
                                    <p className="text-gray-600 dark:text-gray-300">{complaint.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Timer Display */}                        
                        {workStarted && !holdStatus?.is_on_hold && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
                                <div className="flex flex-col md:flex-row items-center justify-between">
                                    <div className="flex items-center mb-4 md:mb-0">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-lg mr-4">
                                            <Timer size={24} className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-blue-800 dark:text-blue-300">
                                                Work In Progress
                                            </h3>
                                            <p className="text-3xl font-bold text-blue-900 dark:text-blue-200 mt-2">
                                                {formatTime(elapsedTime)}
                                            </p>
                                            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                                Elapsed Time
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        {timerRunning ? (
                                            <button
                                                onClick={pauseComplaintTimer}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors min-w-[70px]"
                                            >
                                                <Pause size={16} />
                                                
                                            </button>
                                        ) : (
                                            <button
                                                onClick={resumeComplaintTimer}
                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors min-w-[70px]"
                                            >
                                                <Play size={16} />
                                                {/* Resume  */}
                                            </button>
                                        )}

                                        {/* Hold Button */}
                                        <button
                                            onClick={() => setShowHoldModal(true)}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors min-w-[70px]"
                                        >
                                            <AlertCircle size={16} />
                                            {/* Hold */}
                                        </button>
                                        
                                        <button
                                            onClick={stopComplaintTimer}
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors min-w-[70px]"
                                        >
                                            <StopCircle size={16} />
                                            {/* Complete */}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {holdStatus?.is_on_hold && !workStarted && (
                            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 mb-6">
                                <div className="flex items-start mb-4">
                                    <AlertCircle size={24} className="text-orange-600 dark:text-orange-400 mr-3 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-orange-800 dark:text-orange-300">
                                            Complaint On Hold
                                        </h3>
                                        <p className="text-orange-700 dark:text-orange-400 mb-2">
                                            <span className="font-medium">Reason:</span> {holdStatus.reason}
                                        </p>
                                        {holdStatus.expected_resolution_date && (
                                            <p className="text-orange-700 dark:text-orange-400">
                                                <span className="font-medium">Expected Resolution:</span>{' '}
                                                {new Date(holdStatus.expected_resolution_date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-800 dark:text-white mb-3">
                                        To resume work:
                                    </h4>
                                    <ol className="list-decimal pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                                        <li>Verify your location (scan QR or enter House ID)</li>
                                        <li>Click "Resume from Hold" button</li>
                                        <li>The timer will resume from where it was paused</li>
                                    </ol>
                                </div>
                                
                                {accessGranted ? (
                                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                        <div className="flex items-center">
                                            <Check size={20} className="text-green-600 dark:text-green-400 mr-2" />
                                            <span className="text-green-700 dark:text-green-300">
                                                Location verified! You can now resume work.
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleResumeFromHold}
                                            className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                            disabled={loading}
                                        >
                                            <PlayCircle size={20} />
                                            Resume from Hold
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                                        Please verify your location first to resume work
                                    </p>
                                )}
                            </div>
                        )}

                        {/* {holdStatus?.is_on_hold && (
                            <div className="flex gap-3">
                                <button
                                onClick={handleResumeFromHold}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors min-w-[140px]"
                                >
                                <PlayCircle size={16} />
                                Resume from Hold
                                </button>
                            </div>
                        )} */}

                        {/* Add Hold Status Display */}
                        {/* {holdStatus?.is_on_hold && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                            <AlertCircle size={24} className="text-orange-600 dark:text-orange-400 mr-3 mt-1" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">
                                Complaint On Hold
                                </h3>
                                <p className="text-orange-700 dark:text-orange-400 mb-2">
                                <span className="font-medium">Reason:</span> {holdStatus.reason}
                                </p>
                                {holdStatus.expected_resolution_date && (
                                <p className="text-orange-700 dark:text-orange-400">
                                    <span className="font-medium">Expected Resolution:</span>{' '}
                                    {new Date(holdStatus.expected_resolution_date).toLocaleDateString()}
                                </p>
                                )}
                                <p className="text-sm text-orange-600 dark:text-orange-300 mt-2">
                                Placed on hold by {holdStatus.technician_name} on{' '}
                                {new Date(holdStatus.held_at).toLocaleString()}
                                </p>
                            </div>
                            </div>
                        </div>
                        )} */}

                        {/* Scanning Interface */}
                        {scanning && !workStarted && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                        Scanner Active
                                    </h2>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={toggleCameraDirection}
                                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                                            title={`Switch to ${cameraDirection === 'environment' ? 'Front' : 'Back'} Camera`}
                                        >
                                            <RotateCw size={16} />
                                            <span>Switch Camera</span>
                                        </button>
                                        <button
                                            onClick={handleReset}
                                            className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/40"
                                        >
                                            <X size={16} />
                                            <span>Cancel</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div id="qr-reader" className="rounded-lg overflow-hidden border-2 border-purple-500"></div>
                                    
                                    <div className="absolute top-4 left-4 right-4 text-center z-10">
                                        <div className="inline-block bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                            Scanning {cameraDirection === 'environment' ? 'Back Camera' : 'Front Camera'}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    <p>Scan the house QR code to verify location and start work</p>
                                    <p className="text-xs mt-1 text-purple-600">QR contains House ID only</p>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                                <Loader size={32} className="animate-spin mx-auto text-purple-600 mb-4" />
                                <p className="text-gray-600 dark:text-gray-300">Processing...</p>
                            </div>
                        )}

                        {/* Scanned Results */}
                        {scannedData && !loading && !scanning && !workStarted && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                            House Verification
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {scannedData.source === 'manual' ? 'Manual Entry' : 'QR Scan'} Result
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleReset}
                                        className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <ArrowLeft size={16} />
                                        <span>Try Again</span>
                                    </button>
                                </div>

                                {/* Access Control Status */}
                                {!accessGranted ? (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
                                        <div className="flex items-start">
                                            <AlertCircle size={24} className="text-red-600 dark:text-red-400 mr-3 mt-1" />
                                            <div>
                                                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                                                    Verification Failed
                                                </h3>
                                                <p className="text-red-700 dark:text-red-400">
                                                    {accessDeniedReason}
                                                </p>
                                                <div className="mt-3 text-sm text-red-600 dark:text-red-300">
                                                    <p>Requirements to start work:</p>
                                                    <ul className="list-disc pl-5 mt-1">
                                                        <li>House ID must match the complaint's house</li>
                                                        <li>House must exist in the system</li>
                                                        <li>You must be at the correct location</li>
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
                                                    Location Verified ✓
                                                </h3>
                                                <p className="text-green-700 dark:text-green-400">
                                                    Timer has been started automatically
                                                </p>
                                                
                                                {/* Timer will start automatically */}
                                                <div className="mt-4">
                                                    <div className="flex items-center justify-center bg-white dark:bg-gray-800 p-4 rounded-lg">
                                                        <Clock size={24} className="text-green-600 dark:text-green-400 mr-3" />
                                                        <div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Timer Status</p>
                                                            <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                                                Running...
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Start Scanning/Manual Input - Only show when no scan in progress and work not started */}
                        {!scannedData && !scanning && !loading && !workStarted && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                                <div className="max-w-md mx-auto">
                                    <Wrench size={64} className="mx-auto text-purple-400 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                                        Start Work
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                                        Verify the house location to start working on this complaint
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                        You must verify that you are at the correct house before starting work
                                    </p>
                                    
                                    {/* Manual Input Section */}
                                    <div className="mb-8">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
                                            Enter House ID:
                                        </label>
                                        <input 
                                            type="text" 
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
                                            value={manualHouseId}
                                            onChange={(e) => setManualHouseId(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleManualInput()}
                                            placeholder="Enter the house ID from the complaint" 
                                        />
                                        <button 
                                            onClick={handleManualInput}
                                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FileText size={16} />
                                            Verify & Start Work
                                        </button>
                                    </div>
                                    
                                    <div className="mb-6">
                                        <div className="flex items-center">
                                            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                                            <span className="px-4 text-gray-500 dark:text-gray-400">OR</span>
                                            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                                        </div>
                                    </div>
                                    
                                    {/* QR Scan Section */}
                                    <div>
                                        <QrCode size={48} className="mx-auto text-purple-400 mb-4" />
                                        <button
                                            onClick={startScanning}
                                            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Camera size={20} />
                                            Scan House QR Code
                                        </button>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                                            QR scanning will automatically verify and start timer
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Work Started Section */}
                        {workStarted && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                                <div className="text-center">
                                    <div className="inline-block p-4 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                                        <Wrench size={32} className="text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                                        Work Started Successfully
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                                        You are now working on complaint: <strong>{complaint?.complaint_number}</strong>
                                    </p>
                                    
                                    {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                                            <p className="font-semibold text-gray-800 dark:text-white">
                                                {complaint?.apartment_name} - House {complaint?.house_number}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                                            <p className="font-semibold text-green-600 dark:text-green-400">In Progress</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Timer</p>
                                            <p className="font-semibold text-blue-600 dark:text-blue-400">
                                                {formatTime(elapsedTime)}
                                            </p>
                                        </div>
                                    </div> */}
                                    
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        <p>Remember to stop the timer when you finish your work</p>
                                        <p className="mt-1">The complaint will be marked as completed automatically</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showHoldModal && complaint && (
                <HoldComplaintModal
                    complaint={complaint}
                    onClose={() => setShowHoldModal(false)}
                    onHoldSuccess={handleHoldSuccess}
                />
                )}
            <ToastContainer 
                position="top-center" 
                autoClose={3000}
                className="mt-12 md:mt-0"
            />
        </div>
    );
}