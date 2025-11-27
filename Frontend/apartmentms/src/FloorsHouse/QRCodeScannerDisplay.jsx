import React, { useState, useEffect } from 'react'
import api from '../api/axios'

export default function QRCodeScannerDisplay({ scannedData }) {
    const [houseDetails, setHouseDetails] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const loadFromQR = async () => {
            if (!scannedData) return

            setLoading(true)
            setError(null)

            try {
                const qr = JSON.parse(scannedData)

                // If QR contains DB IDs → fetch fresh data
                if (qr.house_db_id && qr.apartment_db_id) {
                    const [houseRes, billsRes, ownerRes] = await Promise.all([
                        api.get(`/houses/${qr.house_db_id}`),
                        api.get(`/bill-assignments/house-details?house_id=${qr.house_db_id}&apartment_id=${qr.apartment_db_id}`),
                        api.get(`/houseowners/by-house?house_id=${qr.house_db_id}&apartment_id=${qr.apartment_db_id}`)
                    ])

                    const freshHouse = houseRes.data.success ? houseRes.data.data : null
                    const freshBills = billsRes.data.success ? billsRes.data.data : []
                    const freshOwner = ownerRes.data.success ? ownerRes.data.data : null

                    setHouseDetails({
                        ...qr,
                        house_id: freshHouse?.house_id || qr.house_id,
                        status: freshHouse?.status || qr.status,

                        owner_name: freshOwner?.name || qr.owner_name,
                        owner_nic: freshOwner?.NIC || qr.owner_nic,
                        owner_mobile: freshOwner?.mobile || qr.owner_mobile,

                        assigned_bills: freshBills.length
                            ? freshBills.map(b => b.bill_name).join(', ')
                            : qr.assigned_bills,

                        freshData: { house: freshHouse, bills: freshBills, owner: freshOwner }
                    })
                } else {
                    // Old QR (no DB IDs)
                    setHouseDetails(qr)
                }

            } catch (err) {
                console.error(err)
                setError('Invalid QR or failed to fetch data.')
            }

            setLoading(false)
        }

        loadFromQR()

    }, [scannedData])

    if (loading)
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full"></div>
                <span className="ml-2">Loading...</span>
            </div>
        )

    if (error)
        return (
            <div className="bg-red-100 border border-red-400 p-4 rounded">
                {error}
            </div>
        )

    if (!houseDetails)
        return (
            <div className="text-center p-6 text-gray-500">
                Scan a QR code to view details.
            </div>
        )

    return (
        <div className="bg-white dark:bg-gray-800 shadow p-6 rounded-lg max-w-2xl mx-auto">

            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">{houseDetails.house_id}</h1>
                <p>{houseDetails.apartment} • Floor {houseDetails.floor}</p>
                <p className="mt-1 font-medium">
                    Status: {houseDetails.status}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* House Details */}
                <div>
                    <h3 className="font-semibold text-lg mb-3">House Details</h3>
                    <div className="space-y-1">
                        <div className="flex justify-between"><span>Type:</span><span>{houseDetails.house_type}</span></div>
                        <div className="flex justify-between"><span>Square Feet:</span><span>{houseDetails.square_feet}</span></div>
                        <div className="flex justify-between"><span>Rooms:</span><span>{houseDetails.rooms}</span></div>
                        <div className="flex justify-between"><span>Bathrooms:</span><span>{houseDetails.bathrooms}</span></div>
                    </div>
                </div>

                {/* Owner Details */}
                <div>
                    <h3 className="font-semibold text-lg mb-3">Owner Information</h3>

                    {houseDetails.owner_name !== "No Owner Assigned" ? (
                        <div className="space-y-1">
                            <div className="flex justify-between"><span>Name:</span><span>{houseDetails.owner_name}</span></div>
                            <div className="flex justify-between"><span>NIC:</span><span>{houseDetails.owner_nic}</span></div>
                        </div>
                    ) : (
                        <p>No owner assigned.</p>
                    )}
                </div>
            </div>

            {/* Bills */}
            <div className="mt-6">
                <h3 className="font-semibold text-lg mb-2">Assigned Bills</h3>
                <div>
                    {houseDetails.assigned_bills
                        ? houseDetails.assigned_bills.split(',').map((b, i) => (
                            <div key={i}>• {b.trim()}</div>
                        ))
                        : "No bills assigned"}
                </div>
            </div>
        </div>
    )
}
