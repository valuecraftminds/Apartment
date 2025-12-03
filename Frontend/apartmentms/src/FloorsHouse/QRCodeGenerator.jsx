//QRCodeGenerator.jsx
import React, { useEffect, useState } from 'react'
import { Loader, QrCode } from 'lucide-react'
import api from '../api/axios'
import { toast } from 'react-toastify'
import QRCode from 'qrcode'

export default function QRCodeGenerator({ houses, apartment, floor, onClose }) {
    const [loading, setLoading] = useState(false)
    const [generatingPDF, setGeneratingPDF] = useState(false)
    const [assignedBills, setAssignedBills] = useState({})
    const [assignedBillsWithTypes, setAssignedBillsWithTypes] = useState({})
    const [qrCodeImages, setQrCodeImages] = useState({})
    const [housetypes, setHousetypes] = useState([])
    const [houseOwners, setHouseOwners] = useState({})
    const [allBills, setAllBills] = useState([])

    // -----------------------------
    // Load All Bills
    // -----------------------------
    const loadAllBills = async () => {
        try {
            const result = await api.get('/bills')
            if (result.data.success && Array.isArray(result.data.data)) {
                setAllBills(result.data.data)
                return result.data.data
            }
            return []
        } catch (err) {
            console.error('Error loading bills:', err)
            toast.error('Failed to load bills')
            return []
        }
    }

    // -----------------------------
    // Load House Types
    // -----------------------------
    const loadHouseTypes = async () => {
        try {
            const result = await api.get(`/housetype?apartment_id=${apartment.id}`)
            if (result.data.success && Array.isArray(result.data.data)) {
                setHousetypes(result.data.data)
                return result.data.data
            }
            return []
        } catch (err) {
            console.error('Error loading house types:', err)
            toast.error('Failed to load house types')
            return []
        }
    }

    // -----------------------------
    // Load Owner by house
    // -----------------------------
    const loadHouseOwner = async (houseId) => {
        try {
            const res = await api.get(
                `/houseowner/by-house?house_id=${houseId}&apartment_id=${apartment.id}`
            )
            if (res.data.success) {
                return res.data.data
            }
            return null
        } catch (err) {
            if (err.response?.status !== 404) {
                console.error(`Error loading owner for house ${houseId}`, err)
            }
            return null
        }
    }

    // -----------------------------
    // Load ALL house owners
    // -----------------------------
    const loadAllHouseOwners = async (housesList) => {
        const owners = {}

        await Promise.all(
            housesList.map(async (h) => {
                const owner = await loadHouseOwner(h.id)
                if (owner) owners[h.id] = owner
            })
        )

        setHouseOwners(owners)
        return owners
    }

    // -----------------------------
    // Load Bills with Types
    // -----------------------------
    // FIXED: Load Bills with Types AND actual bill_id
    const loadAssignedBillsForHouse = async (houseId, billsList) => {
        try {
            const res = await api.get(
                `/bill-assignments/house-details?house_id=${houseId}&apartment_id=${apartment.id}`
            )
            
            console.log(`DEBUG: API Response for house ${houseId}:`, res.data.data); // ADD THIS
            
            if (res.data.success && Array.isArray(res.data.data)) {
                // Debug: Check what fields are available
                if (res.data.data.length > 0) {
                    console.log('DEBUG: First assignment keys:', Object.keys(res.data.data[0]));
                    console.log('DEBUG: First assignment:', res.data.data[0]);
                }

                // Get bill names only (for backward compatibility)
                const billNames = res.data.data
                    .filter(b => b.bill_name?.trim())
                    .map(b => b.bill_name)

                // Get bills with types AND IDs
                const billsWithTypes = res.data.data
                    .filter(b => b.bill_name?.trim())
                    .map(billAssignment => {
                        console.log('DEBUG: Processing assignment:', billAssignment); // ADD THIS
                        
                        // Find the corresponding bill from allBills to get ALL details
                        const billDetails = billsList.find(bill => 
                            bill.id === billAssignment.bill_id ||  // Try matching by ID
                            bill.bill_name === billAssignment.bill_name // Or by name
                        )
                        
                        console.log('DEBUG: Found bill details:', billDetails); // ADD THIS
                        
                        return {
                            name: billAssignment.bill_name,
                            type: billDetails?.billtype || 'Unknown',
                            is_meiered: billDetails?.is_meiered || false,
                            id: billAssignment.bill_id, // ← THIS IS CRITICAL: Use the assignment's bill_id
                            assignment_id: billAssignment.id // ← Optional: include assignment id if needed
                        }
                    })

                console.log('DEBUG: Final billsWithTypes:', billsWithTypes); // ADD THIS

                return {
                    billNames,
                    billsWithTypes
                }
            }
            return { billNames: [], billsWithTypes: [] }
        } catch (err) {
            console.error(`Error loading bills for house ${houseId}`, err)
            return { billNames: [], billsWithTypes: [] }
        }
    }
    // -----------------------------
    useEffect(() => {
        const run = async () => {
            if (!houses.length) return

            setLoading(true)

            try {
                // Load All Bills and Types first
                const [billsList, typeList] = await Promise.all([
                    loadAllBills(),
                    loadHouseTypes()
                ])

                // Load Owners
                const owners = await loadAllHouseOwners(houses)

                const billsMap = {}
                const billsWithTypesMap = {}
                const qrMap = {}
                const ownersMap = {}

                for (const house of houses) {
                    const [owner, billsData] = await Promise.all([
                        loadHouseOwner(house.id),
                        loadAssignedBillsForHouse(house.id, billsList)
                    ])
                      
                    ownersMap[house.id] = owner
                    billsMap[house.id] = billsData.billNames
                    billsWithTypesMap[house.id] = billsData.billsWithTypes

                    const type = typeList.find(t => t.id === house.housetype_id)

                    // SIMPLIFIED QR DATA - Optimized for scanning
                    const qrData = {
                        // Essential identifiers
                        h_id: house.house_id, // Shortened key names
                        apt: apartment.name, // Shortened
                        fl: floor.floor_id, // Shortened
                        apt_id: apartment.id,
                        house_db_id: house.id,
                        
                        // Basic house info
                        st: house.status, // status
                        ht: type?.name || "N/A", // house_type

                          // House details (ADD THESE)
                        sqf: type?.sqrfeet || "N/A", // square feet
                        rms: type?.rooms || "N/A", // rooms
                        bth: type?.bathrooms || "N/A", // bathrooms
    
                        
                        // Owner info (shortened)
                        own: owner?.name || "No Owner", // owner_name
                        nic: owner?.NIC || "N/A", // owner_nic
                        
                        // Bills info - simplified structure
                        bills: billsData.billsWithTypes.map(bill => ({
                            id: bill.id,
                             n: bill.name,      // name
                             t: bill.type,      // type
                             m: bill.is_meiered // is_meiered
                             
                        })),
                        
                        // Scan metadata
                        scan: "house", // scan_type
                        ts: Date.now() // timestamp instead of ISO string
                    }

                    // Generate QR with optimized settings
                    try {
                        const qrString = JSON.stringify(qrData)
                        console.log(`QR Data length for ${house.house_id}:`, qrString.length)
                        
                        qrMap[house.id] = await QRCode.toDataURL(qrString, {
                            width: 400, // Increased size for better scanning
                            margin: 4, // Increased margin
                            errorCorrectionLevel: "H", // Highest error correction
                            color: {
                                dark: "#000000", // Pure black
                                light: "#FFFFFF" // Pure white
                            }
                        })
                    } catch (err) {
                        console.error("QR Gen Error:", err)
                        qrMap[house.id] = ""
                    }
                }

                setAssignedBills(billsMap)
                setAssignedBillsWithTypes(billsWithTypesMap)
                setQrCodeImages(qrMap)

            } catch (error) {
                console.error("Error preparing data", error)
                toast.error("Failed to generate QR data")
            }

            setLoading(false)
        }

        run()
    }, [houses, apartment, floor])

    // ==========================================================
    // Generate PDF
    // ==========================================================
    const downloadPDF = async () => {
        setGeneratingPDF(true)

        try {
            const { jsPDF } = await import("jspdf")
            const pdf = new jsPDF("p", "mm", "a4")

            const cardW = 85
            const cardH = 70
            const margin = 12
            const qrSize = 40 // Increased QR size in PDF
            const pageW = pdf.internal.pageSize.getWidth()
            const pageH = pdf.internal.pageSize.getHeight()
            let yOffset = margin

            for (let i = 0; i < houses.length; i++) {
                const h = houses[i]
                const type = housetypes.find(t => t.id === h.housetype_id)
                const owner = houseOwners[h.id]

                const col = i % 2
                const x = margin + col * (cardW + margin)

                if (i % 2 === 0 && i !== 0) {
                    yOffset += cardH + margin
                    if (yOffset + cardH > pageH - margin) {
                        pdf.addPage()
                        yOffset = margin
                    }
                }

                // Card Box
                pdf.setDrawColor(200, 200, 200)
                pdf.rect(x, yOffset, cardW, cardH)

                // Titles
                pdf.setFontSize(9)
                pdf.setFont(undefined, "bold")
                pdf.text(apartment.name, x + cardW / 2, yOffset + 6, { align: 'center' })

                pdf.setFontSize(7)
                pdf.text(`Floor: ${floor.floor_id}`, x + cardW / 2, yOffset + 10, { align: 'center' })

                // House ID
                pdf.setFontSize(11)
                pdf.text(h.house_id, x + cardW / 2, yOffset + 16, { align: 'center' })

                // QR - Increased size and quality
                if (qrCodeImages[h.id]) {
                    pdf.addImage(
                        qrCodeImages[h.id], 
                        "PNG", 
                        x + (cardW - qrSize) / 2, 
                        yOffset + 20, // Adjusted position
                        qrSize, 
                        qrSize
                    )
                }

                // Bills info
                const bills = assignedBillsWithTypes[h.id] || []
                if (bills.length > 0) {
                    pdf.setFontSize(4)
                    pdf.setTextColor(100, 100, 100)
                    let billY = yOffset + cardH - 5
                    bills.slice(0, 2).forEach((bill, index) => {
                        pdf.text(`${bill.name}: ${bill.type}`, x + 2, billY - (index * 2))
                    })
                    if (bills.length > 2) {
                        pdf.text(`+${bills.length - 2} more...`, x + 2, yOffset + cardH - 2)
                    }
                }
            }

            pdf.save(
                `QR_Codes_${apartment.name.replace(/\s+/g, '_')}_Floor_${floor.floor_id}.pdf`
            )
            toast.success("PDF Generated Successfully!")

        } catch (err) {
            console.error(err)
            toast.error("Failed to generate PDF")
        }

        setGeneratingPDF(false)
    }

    // ==========================================================
    // QR Preview Component
    // ==========================================================
    const QRCodePreview = ({ house }) => {
        const bills = assignedBills[house.id] || []
        const billsWithTypes = assignedBillsWithTypes[house.id] || []
        const qrImg = qrCodeImages[house.id]
        const type = housetypes.find(t => t.id === house.housetype_id)
        const owner = houseOwners[house.id]

        return (
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                <div className="text-center">
                    <div className="font-bold text-gray-800 dark:text-white text-lg mb-1">
                        {house.house_id}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {apartment.name} • Floor {floor.floor_id}
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                        <div className="flex justify-between">
                            <span>Type: <strong>{type?.name || "N/A"}</strong></span>
                            <span>Status: <strong>{house.status}</strong></span>
                        </div>

                        {owner && (
                            <div className="mt-1 text-left">
                                <div className="font-semibold">Owner:</div>
                                <div>{owner.name}</div>
                                <div className="text-xs">NIC: {owner.NIC}</div>
                            </div>
                        )}
                    </div>

                    {qrImg ? (
                        <div className="flex flex-col items-center">
                            <img
                                src={qrImg}
                                className="mx-auto mb-2 rounded border-2 border-gray-300"
                                style={{ width: "150px", height: "150px" }} // Larger preview
                                alt={`QR Code for ${house.house_id}`}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                Scan this QR code
                            </div>
                        </div>
                    ) : (
                        <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
                            <Loader size={24} className="animate-spin" />
                        </div>
                    )}

                    <div className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                        <div className="font-semibold">Assigned Bills:</div>
                        <div className="mt-1 max-h-16 overflow-y-auto text-left">
                            {billsWithTypes.length ? (
                                billsWithTypes.map((bill, i) => (
                                    <div key={i} className="flex justify-between items-start">
                                        <span>• {bill.name}</span>
                                        <span className="text-xs bg-blue-100 dark:bg-blue-800 px-1 rounded ml-1">
                                            {bill.type}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                "No bills assigned"
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Test QR Code Scanning
    const testQRCode = (houseId) => {
        const qrImg = qrCodeImages[houseId]
        if (qrImg) {
            // Open QR code in new tab for testing
            const newWindow = window.open()
            newWindow.document.write(`
                <html>
                    <head><title>Test QR Code</title></head>
                    <body style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
                        <h2>Test QR Code Scanning</h2>
                        <img src="${qrImg}" style="width: 300px; height: 300px; border: 2px solid #000;" />
                        <p>Try scanning this QR code with your phone</p>
                        <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #6b46c1; color: white; border: none; border-radius: 5px; cursor: pointer;">
                            Close
                        </button>
                    </body>
                </html>
            `)
        }
    }

    // ==========================================================
    // MAIN RENDER
    // ==========================================================
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Generate QR Codes
                    </h2>
                    <button onClick={onClose} className="p-1 text-gray-600">✖</button>
                </div>

                {/* Preview */}
                <div className="mb-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Preview for {houses.length} selected house{houses.length !== 1 ? "s" : ""}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2">
                        {houses.map(h => (
                            <div key={h.id} className="relative">
                                <QRCodePreview house={h} />
                                <button
                                    onClick={() => testQRCode(h.id)}
                                    className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded text-xs"
                                >
                                    Test Scan
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                        The QR codes contain house, owner & bill information with bill types.
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading || generatingPDF || !Object.keys(qrCodeImages).length}
                            onClick={downloadPDF}
                            className="px-4 py-2 rounded bg-purple-600 text-white flex items-center gap-2"
                        >
                            {generatingPDF ? (
                                <>
                                    <Loader size={16} className="animate-spin" />
                                    Generating PDF...
                                </>
                            ) : (
                                <>
                                    <QrCode size={16} />
                                    Download PDF
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}