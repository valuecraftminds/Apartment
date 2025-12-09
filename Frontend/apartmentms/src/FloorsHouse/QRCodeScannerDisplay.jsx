import React, { useState, useEffect } from 'react'
import api from '../api/axios'
import { Building, Home, User, Shield, AlertCircle } from 'lucide-react'

export default function QRCodeScannerDisplay({ scannedData }) {
    const [displayInfo, setDisplayInfo] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isValidQR, setIsValidQR] = useState(false)

    useEffect(() => {
        const processQRCode = async () => {
            if (!scannedData) {
                setDisplayInfo(null)
                return
            }

            setLoading(true)
            setError(null)

            try {
                const qr = JSON.parse(scannedData)
                
                // Check if this is a valid AptSync QR code
                const isValidAptSyncQR = qr.type === "house_qr" || 
                                       qr.scan_type === "house_info" ||
                                       (qr.apartment_id && qr.house_id)
                
                if (!isValidAptSyncQR) {
                    // Not an AptSync QR code - show generic message
                    setIsValidQR(false)
                    setDisplayInfo({
                        type: 'generic',
                        message: 'This is not a valid AptSync QR code.'
                    })
                    setLoading(false)
                    return
                }

                setIsValidQR(true)
                
                // If it's a valid AptSync QR but scanned outside our app, show welcome message
                if (qr.apartment_id && qr.house_id) {
                    // You could fetch minimal public info if needed, but for privacy, keep it minimal
                    try {
                        // Fetch only basic, non-sensitive information
                        const houseRes = await api.get(`/houses/${qr.house_id}`)
                        if (houseRes.data.success) {
                            const house = houseRes.data.data
                            setDisplayInfo({
                                type: 'aptsync',
                                apartment_id: qr.apartment_id,
                                house_id: house.house_id,
                                apartment_name: qr.apartment_name || 'Apartment',
                                floor_number: qr.floor_number || '',
                                is_public: true
                            })
                        }
                    } catch (fetchErr) {
                        // If fetch fails, still show welcome message with minimal info
                        setDisplayInfo({
                            type: 'aptsync',
                            apartment_id: qr.apartment_id,
                            house_id: qr.house_id,
                            is_public: true
                        })
                    }
                }

            } catch (err) {
                console.error('QR parsing error:', err)
                setError('Invalid QR code format.')
                setIsValidQR(false)
            }

            setLoading(false)
        }

        processQRCode()

    }, [scannedData])

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8 min-h-[300px]">
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
                    <span className="mt-3 block text-gray-600 dark:text-gray-400">Processing QR code...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center min-h-[300px] flex flex-col justify-center">
                <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Invalid QR Code</h3>
                <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
        )
    }

    if (!scannedData) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center min-h-[300px] flex flex-col justify-center">
                <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                    <Building className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Ready to Scan</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Scan a QR code to access AptSync information
                </p>
            </div>
        )
    }

    // Show generic welcome message for non-AptSync QR codes
    if (!isValidQR) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center min-h-[300px] flex flex-col justify-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    Unknown QR Code
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {displayInfo?.message || 'This QR code is not recognized by AptSync.'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                    Please scan a valid AptSync QR code.
                </p>
            </div>
        )
    }

    // Show welcome message for valid AptSync QR codes (scanned outside app)
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-center text-white">
                <div className="flex justify-center mb-4">
                    <div className="bg-white/20 p-3 rounded-full">
                        <Building className="h-10 w-10" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold mb-2">Welcome to AptSync</h1>
                <p className="opacity-90">Smart Apartment Management System</p>
            </div>

            {/* Main Content */}
            <div className="p-6">
                {/* Privacy Notice */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                                Privacy Protected
                            </h3>
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                This QR code contains only house identification. Detailed information 
                                is securely stored and accessible only through the official AptSync app.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Basic Information (Non-sensitive) */}
                <div className="space-y-4">
                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                            House Information
                        </h2>
                        <div className="flex flex-col items-center space-y-2">
                            {displayInfo?.apartment_name && (
                                <div className="flex items-center text-gray-700 dark:text-gray-300">
                                    <Building className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                                    <span>{displayInfo.apartment_name}</span>
                                </div>
                            )}
                            
                            {displayInfo?.house_id && (
                                <div className="flex items-center text-gray-700 dark:text-gray-300">
                                    <Home className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                                    <span className="font-medium">House {displayInfo.house_id}</span>
                                </div>
                            )}
                            
                            {displayInfo?.floor_number && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Floor {displayInfo.floor_number}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Get the App Section */}
                    <div className="border-t dark:border-gray-700 pt-6 mt-6">
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-3 text-center">
                            Want to see more details?
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
                                Download the AptSync mobile app to access full house details, 
                                bill information, and management features.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                                    Download iOS App
                                </button>
                                <button className="px-4 py-2 bg-gray-800 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-700 transition-colors text-sm">
                                    Download Android App
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                    <p className="text-center text-xs text-gray-500 dark:text-gray-500">
                        QR Code ID: {displayInfo?.apartment_id || 'N/A'} • 
                        Scanned at: {new Date().toLocaleTimeString()}
                    </p>
                    <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-1">
                        © {new Date().getFullYear()} AptSync. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}